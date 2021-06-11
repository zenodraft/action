const {getInput,setFailed} = require('@actions/core');
const {context} = require('@actions/github');
//const zenodraft = require('zenodraft');


try {
    const collection_id = getInput('in-collection');
    const sandbox = getInput('sandbox') === 'true' ? true : false;
    
    if (collection_id !== '') {
        console.log(`Going to be publishing in collection ${collection_id}.`);
    } else {
        console.log(`Going to be publishing in new collection.`);
    }

    if (sandbox) {
        console.log(`Going to be publishing on Zenodo Sandbox.`);
    } else {
        console.log(`Going to be publishing on Zenodo`);
    }


    const payload = JSON.stringify(context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    setFailed(error.message);
}
