import {getInput,setFailed} from '@actions/core';
import {exec} from '@actions/exec';
import {
    create_empty_deposition_in_existing_collection,
    create_empty_deposition_in_new_collection,
    add_file_to_deposition,
    update_deposition_metadata
} from 'zenodraft';


export const main = async (): Promise<void> => {

    try {
        const collection_id = getInput('collection');
        const sandbox = getInput('sandbox') === 'false' ? false : true;
        const zenodraft = 'node_modules/zenodraft/bin/index.js';
        const verbose = false;
        
        let latest_id;
        if (collection_id === '') {
            latest_id = await create_empty_deposition_in_new_collection(sandbox, verbose)
        } else {
            latest_id = await create_empty_deposition_in_existing_collection(sandbox, collection_id, verbose)
        }
        await add_file_to_deposition(sandbox, latest_id, 'test.txt', verbose);
        await exec(zenodraft, [sandbox, 'metadata', 'update', latest_id, '.zenodo.json']);
        await update_deposition_metadata(sandbox, latest_id, '.zenodo.json', verbose);
    } catch (error) {
        setFailed(error.message);
    }
}
