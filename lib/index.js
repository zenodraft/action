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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const exec_1 = require("@actions/exec");
const core_1 = require("@actions/core");
const get_payload_1 = require("./releasing/get_payload");
const update_github_state_1 = require("./releasing/update_github_state");
const upsert_prereserved_doi_1 = require("./upserting/upsert_prereserved_doi");
const assert_1 = __importDefault(require("assert"));
const zenodraft_1 = __importDefault(require("zenodraft"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collection_id = core_1.getInput('collection');
        const compression = core_1.getInput('compression');
        const filenames = core_1.getInput('filenames');
        const metadata = core_1.getInput('metadata');
        const publish = core_1.getInput('publish') === 'true' ? true : false;
        const sandbox = core_1.getInput('sandbox') === 'false' ? false : true;
        const upsert_doi = core_1.getInput('upsert-doi') === 'true' ? true : false;
        const upsert_location = core_1.getInput('upsert-location');
        const verbose = false;
        assert_1.default(['tar.gz', 'zip'].includes(compression), 'Invalid value for input argument \'compression\'.');
        assert_1.default((new RegExp('[0-9]+')).test(collection_id) || collection_id === '', 'Invalid value for input argument \'collection\'.');
        // calling this next function will throw if the triggering event is unsupported
        const payload = yield get_payload_1.get_payload(metadata);
        // create the deposition as a new version in a new collection or
        // as a new version in an existing collection:
        let latest_id;
        if (collection_id === '') {
            latest_id = yield zenodraft_1.default.deposition_create_in_new_collection(sandbox, verbose);
        }
        else {
            latest_id = yield zenodraft_1.default.deposition_create_in_existing_collection(sandbox, collection_id, verbose);
        }
        if (upsert_doi === true) {
            const prereserved_doi = yield zenodraft_1.default.deposition_show_prereserved(sandbox, latest_id, verbose);
            upsert_prereserved_doi_1.upsert_prereserved_doi(upsert_location, prereserved_doi);
        }
        // upload only the files specified in the filenames argument, or
        // upload a snapshot of the complete repository
        if (filenames === '') {
            const archive_name = `${payload.contents.repository.name}.${compression}`;
            if (compression === 'tar.gz') {
                yield exec_1.exec('touch', [archive_name]);
                yield exec_1.exec('tar', ['--exclude=.git', `--exclude=${archive_name}`, '-zcvf', archive_name, '.']);
                yield zenodraft_1.default.file_add(sandbox, latest_id, archive_name, verbose);
            }
            else if (compression === 'zip') {
                yield exec_1.exec('zip', ['-r', '-x', '/.git*', '-v', archive_name, '.']);
                yield zenodraft_1.default.file_add(sandbox, latest_id, archive_name, verbose);
            }
            else {
                throw new Error('Unknown compression method.');
            }
        }
        else {
            for (const filename of filenames.split(' ')) {
                yield zenodraft_1.default.file_add(sandbox, latest_id, filename, verbose);
            }
        }
        // update the metadata if the user has specified a filename that contains metadata
        if (metadata !== '') {
            yield zenodraft_1.default.metadata_update(sandbox, latest_id, metadata, verbose);
        }
        if (publish === true) {
            yield zenodraft_1.default.deposition_publish(sandbox, latest_id, verbose);
        }
        yield update_github_state_1.update_github_state(payload, upsert_doi, metadata);
    }
    catch (error) {
        core_1.setFailed(error.message);
    }
});
exports.main = main;
exports.main();
