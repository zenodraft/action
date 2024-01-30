import { exec } from '@actions/exec'
import * as core from '@actions/core'
import { get_payload } from './releasing/'
import { update_github_state } from './releasing/'
import { upsert_prereserved_doi } from './upserting/'
import assert from 'assert'
import zenodraft from 'zenodraft'


const read_inputs = () => {
    const collection_id = core.getInput('collection')
    const compression = core.getInput('compression')
    const filenames = core.getInput('filenames')
    const metadata = core.getInput('metadata')
    const publish = core.getInput('publish') === 'true' ? true : false
    const sandbox = core.getInput('sandbox') === 'false' ? false : true
    const upsert_doi = core.getInput('upsert-doi') === 'true' ? true : false
    const upsert_location = core.getInput('upsert-location')
    const verbose = core.getInput('verbose') === 'true' ? true : false

    assert(['tar.gz', 'zip'].includes(compression), 'Invalid value for input argument \'compression\'.' )
    assert((new RegExp('[0-9]+')).test(collection_id) || collection_id === '', 'Invalid value for input argument \'collection\'.')

    return {
        collection_id,
        compression,
        filenames,
        metadata,
        publish,
        sandbox,
        upsert_doi,
        upsert_location,
        verbose
    }
}



export const main = async (): Promise<void> => {

    try {

        core.startGroup('processing user input')
        const {
            collection_id,
            compression,
            filenames,
            metadata,
            publish,
            sandbox,
            upsert_doi,
            upsert_location,
            verbose
        } = read_inputs()
        core.endGroup()

        // calling this next function will throw if the triggering event is unsupported
        core.startGroup('payload')
        const payload = await get_payload(metadata)
        core.endGroup()

        // create the deposition as a new version in a new collection or
        // as a new version in an existing collection:
        core.startGroup(`creating deposition on ${sandbox === true ? 'Zenodo Sandbox' : 'Zenodo'}`)
        let latest_id;
        if (collection_id === '') {
            latest_id = await zenodraft.deposition_create_in_new_collection(sandbox, verbose)
        } else {
            latest_id = await zenodraft.deposition_create_in_existing_collection(sandbox, collection_id, verbose)
        }
        core.endGroup()

        if (upsert_doi === true) {
            core.startGroup('upserting doi')
            const prereserved_doi = await zenodraft.deposition_show_prereserved(sandbox, latest_id, verbose)
            upsert_prereserved_doi(upsert_location, prereserved_doi)
            core.endGroup()
        }

        core.startGroup('adding files')
        // upload only the files specified in the filenames argument, or
        // upload a snapshot of the complete repository
        if (filenames === '') {
            const archive_name = `${payload.contents.repository.name}.${compression}`
            if (compression === 'tar.gz') {
                await exec('touch', [archive_name])
                await exec('tar', ['--exclude=.git', `--exclude=${archive_name}`, '-zcvf', archive_name, '.'])
                await zenodraft.file_add(sandbox, latest_id, archive_name, verbose)
            } else if (compression === 'zip') {
                await exec('zip', ['-r', '-x', '/.git*', '-v', archive_name, '.'])
                await zenodraft.file_add(sandbox, latest_id, archive_name, verbose)
            } else {
                throw new Error('Unknown compression method.')
            }
        } else {
            for (const filename of filenames.split(' ')) {
                await zenodraft.file_add(sandbox, latest_id, filename, verbose)
            }
        }
        core.endGroup()

        // update the metadata if the user has specified a filename that contains metadata
        if (metadata !== '') {
            core.startGroup('adding metadata')
            await zenodraft.metadata_update(sandbox, latest_id, metadata, verbose)
            core.endGroup() 
        }

        if (publish === true) {
            core.startGroup('publishing')
            await zenodraft.deposition_publish(sandbox, latest_id, verbose)
            core.endGroup()
        }

        await update_github_state(payload, upsert_doi, metadata)

    } catch (error: any) {
        core.setFailed(error.message)
    }
}

main()
