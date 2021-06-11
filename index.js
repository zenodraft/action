const {getInput,setFailed} = require('@actions/core');
const {create_empty_deposition_in_new_collection, create_empty_deposition_in_existing_collection} = require('zenodraft');


try {
    const collection_id = getInput('in-collection');
    const sandbox = getInput('sandbox') === 'true' ? true : false;
    
    if (collection_id !== '') {
        console.log(`Going to be publishing in collection ${collection_id}.`);
        create_empty_deposition_in_existing_collection(sandbox, collection_id, false);

    } else {
        console.log(`Going to be publishing in new collection.`);
        create_empty_deposition_in_new_collection(sandbox, false);
    }

    if (sandbox) {
        console.log(`Going to be publishing on Zenodo Sandbox.`);
    } else {
        console.log(`Going to be publishing on Zenodo`);
    }

    console.log(zenodraft);

} catch (error) {
    setFailed(error.message);
}
