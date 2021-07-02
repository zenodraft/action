import { exec } from '@actions/exec'
import { getInput,setFailed } from '@actions/core'
import { get_payload as validate_triggering_event } from './releasing'
import { update_github_state } from './releasing'
import { upsert_prereserved_doi } from './upserting'
import zenodraft from 'zenodraft'



export const main = async (): Promise<void> => {

    try {

        const collection_id = getInput('collection')
        const compression = getInput('compression')
        const filenames = getInput('filenames')
        const metadata = getInput('metadata')
        const publish = getInput('publish') === 'true' ? true : false
        const sandbox = getInput('sandbox') === 'false' ? false : true
        const upsert_doi = getInput('upsert-doi') === 'true' ? true : false
        const upsert_location = getInput('upsert-location')
        const verbose = false

        // calling this next function will throw if the triggering event is unsupported
        const payload = validate_triggering_event(metadata)

        // create the deposition as a new version in a new collection or
        // as a new version in an existing collection:
        let latest_id;
        if (collection_id === '') {
            latest_id = await zenodraft.deposition_create_in_new_collection(sandbox, verbose)
        } else {
            latest_id = await zenodraft.deposition_create_in_existing_collection(sandbox, collection_id, verbose)
        }

        if (upsert_doi === true) {
            const prereserved_doi = await zenodraft.deposition_show_prereserved(sandbox, latest_id, verbose)
            await upsert_prereserved_doi(upsert_location, prereserved_doi)
        }

        // upload only the files specified in the filenames argument, or
        // upload a snapshot of the complete repository
        if (filenames === '') {
            if (compression === 'tar.gz') {
                await exec('touch', ['archive.tar.gz'])
                await exec('tar', ['--exclude=.git', '--exclude=archive.tar.gz', '-zcvf', 'archive.tar.gz', '.'])
                await zenodraft.file_add(sandbox, latest_id, 'archive.tar.gz', verbose)
            } else if (compression === 'zip') {
                await exec('zip', ['-r', '-x', '/.git*', '-v', 'archive.zip', '.'])
                await zenodraft.file_add(sandbox, latest_id, 'archive.zip', verbose)
            } else {
                throw new Error('Unknown compression method.')
            }
        } else {
            for (const filename of filenames.split(' ')) {
                await zenodraft.file_add(sandbox, latest_id, filename, verbose)
            }
        }

        // update the metadata if the user has specified a filename that contains metadata
        if (metadata !== '') {
            await zenodraft.metadata_update(sandbox, latest_id, metadata, verbose)
        }

        if (publish === true) {
            await zenodraft.deposition_publish(sandbox, latest_id, verbose)
        }

        update_github_state(payload)

    } catch (error) {
        setFailed(error.message)
    }
}

main()
