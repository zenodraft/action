import {getInput,setFailed} from '@actions/core';
import zenodraft from 'zenodraft'

export const main = async (): Promise<void> => {

    try {
        const collection_id = getInput('collection');
        const sandbox = getInput('sandbox') === 'false' ? false : true;
        const verbose = false;
        
        let latest_id;
        if (collection_id === '') {
            latest_id = await zenodraft.deposition_create_in_new_collection(sandbox, verbose)
        } else {
            latest_id = await zenodraft.deposition_create_in_existing_collection(sandbox, collection_id, verbose)
        }
        await zenodraft.file_add(sandbox, latest_id, 'test.txt', verbose);
        await zenodraft.metadata_update(sandbox, latest_id, '.zenodo.json', verbose);
    } catch (error) {
        setFailed(error.message);
    }
}

main()
