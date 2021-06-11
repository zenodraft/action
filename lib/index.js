"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const zenodraft_1 = require("zenodraft");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collection_id = core_1.getInput('collection');
        const sandbox = core_1.getInput('sandbox') === 'false' ? false : true;
        const zenodraft = 'node_modules/zenodraft/bin/index.js';
        const verbose = false;
        let latest_id;
        if (collection_id === '') {
            latest_id = yield zenodraft_1.create_empty_deposition_in_new_collection(sandbox, verbose);
        }
        else {
            latest_id = yield zenodraft_1.create_empty_deposition_in_existing_collection(sandbox, collection_id, verbose);
        }
        yield zenodraft_1.add_file_to_deposition(sandbox, latest_id, 'test.txt', verbose);
        yield exec_1.exec(zenodraft, [sandbox, 'metadata', 'update', latest_id, '.zenodo.json']);
        yield zenodraft_1.update_deposition_metadata(sandbox, latest_id, '.zenodo.json', verbose);
    }
    catch (error) {
        core_1.setFailed(error.message);
    }
});
exports.main = main;
