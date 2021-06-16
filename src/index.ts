import {getInput,setFailed} from '@actions/core';
import zenodraft from 'zenodraft'


export const main = async (): Promise<void> => {

    try {
        const collection_id = getInput('collection');
        const sandbox = getInput('sandbox') === 'false' ? false : true;
        const verbose = false;
        
        let latest_id;
        if (collection_id === '') {
            latest_id = await zenodraft.create_empty_deposition_in_new_collection(sandbox, verbose)
        } else {
            latest_id = await zenodraft.create_empty_deposition_in_existing_collection(sandbox, collection_id, verbose)
        }
        await zenodraft.add_file_to_deposition(sandbox, latest_id, 'test.txt', verbose);
        await zenodraft.update_deposition_metadata(sandbox, latest_id, '.zenodo.json', verbose);
    } catch (error) {
        setFailed(error.message);
    }
}

main()
