import { exec } from '@actions/exec'
import * as core from '@actions/core'
import { get_payload } from './releasing/'
import { update_github_state } from './releasing/'
import { upsert_prereserved_doi } from './upserting/'
import assert from 'assert'
// import { default as zenodraft } from 'zenodraft'
import * as zenodraft from 'zenodraft'


const read_inputs = () => {
    const concept_id = core.getInput('concept')
    const compression = core.getInput('compression')
    const filenames = core.getInput('filenames')
    const metadata = core.getInput('metadata')
    const publish = core.getInput('publish') === 'true' ? true : false
    const sandbox = core.getInput('sandbox') === 'false' ? false : true
    const token = sandbox ? process.env.ZENODO_SANDBOX_ACCESS_TOKEN || '' : process.env.ZENODO_ACCESS_TOKEN || ''
    const upsert_doi = core.getInput('upsert-doi') === 'true' ? true : false
    const upsert_location = core.getInput('upsert-location')
    const verbose = core.getInput('verbose') === 'true' ? true : false


    assert(['tar.gz', 'zip'].includes(compression), 'Invalid value for input argument \'compression\'.' )
    assert((new RegExp('[0-9]+')).test(concept_id) || concept_id === '', 'Invalid value for input argument \'concept\'.')

    return {
        concept_id,
        compression,
        filenames,
        metadata,
        publish,
        sandbox,
        token,
        upsert_doi,
        upsert_location,
        verbose
    }
}



export const main = async (): Promise<void> => {

    try {

        core.startGroup('processing user input')
        const {
            concept_id,
            compression,
            filenames,
            metadata,
            publish,
            sandbox,
            token,
            upsert_doi,
            upsert_location,
            verbose
        } = read_inputs()
        core.endGroup()

        // calling this next function will throw if the triggering event is unsupported
        core.startGroup('payload')
        const payload = await get_payload(metadata)
        core.endGroup()

        core.debug(`zenodraft = ${zenodraft}`)

        // create the deposition as a new version in a new concept or
        // as a new version in an existing concept:
        core.startGroup(`creating deposition on ${sandbox === true ? 'Zenodo Sandbox' : 'Zenodo'}`)
        let version_id;
        if (concept_id === '') {
            version_id = await zenodraft.deposition_create_concept(token, sandbox, verbose)
        } else {
            version_id = await zenodraft.deposition_create_version(token, sandbox, concept_id, verbose)
        }
        core.endGroup()

        if (upsert_doi === true) {
            core.startGroup('upserting doi')
            const prereserved_doi = await zenodraft.deposition_show_prereserved(token, sandbox, version_id, verbose)
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
                await zenodraft.file_add(token, sandbox, version_id, archive_name, verbose)
            } else if (compression === 'zip') {
                await exec('zip', ['-r', '-x', '/.git*', '-v', archive_name, '.'])
                await zenodraft.file_add(token, sandbox, version_id, archive_name, verbose)
            } else {
                throw new Error('Unknown compression method.')
            }
        } else {
            for (const filename of filenames.split(' ')) {
                await zenodraft.file_add(token, sandbox, version_id, filename, verbose)
            }
        }
        core.endGroup()

        // update the metadata if the user has specified a filename that contains metadata
        if (metadata !== '') {
            core.startGroup('adding metadata')
            await zenodraft.metadata_update(token, sandbox, version_id, metadata, verbose)
            core.endGroup() 
        }

        if (publish === true) {
            core.startGroup('publishing')
            await zenodraft.deposition_publish(token, sandbox, version_id, verbose)
            core.endGroup()
        }

        await update_github_state(payload, upsert_doi, metadata)

    } catch (error: any) {
        core.setFailed(error.message)
    }
}

main()
