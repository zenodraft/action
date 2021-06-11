(async () => {
    const {getInput,setFailed} = require('@actions/core');
    const {exec} = require('@actions/exec');
    
    try {
        const collection_id = getInput('collection');
        const sandbox = getInput('sandbox') === 'false' ? '' : '--sandbox';
        const zenodraft = 'node_modules/zenodraft/bin/index.js';
        
        let latest_id;
        if (collection_id !== '') {
            latest_id = await exec(zenodraft, [sandbox, 'deposition', 'create', 'in-existing-collection', collection_id]);
        } else {
            latest_id = await exec(zenodraft, [sandbox, 'deposition', 'create', 'in-new-collection']);
        }

        await exec(zenodraft, [sandbox, 'file', 'add', latest_id, 'test.txt']);
        await exec(zenodraft, [sandbox, 'metadata', 'update', latest_id, '.zenodo.json']);

    } catch (error) {
        setFailed(error.message);
    }
})()