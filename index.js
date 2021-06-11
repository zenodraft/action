const {getInput,setFailed} = require('@actions/core');
import {exec} from '@actions/exec';


try {
    const collection_id = getInput('in-collection');
    const sandbox = getInput('sandbox') === 'true' ? true : false;
    
    if (collection_id !== '') {
        console.log(`Going to be publishing in collection ${collection_id}.`);
        await exec('zenodraft', ['--sandbox', 'deposition', 'create', 'in-collection', collection_id])
    } else {
        console.log(`Going to be publishing in new collection.`);
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
