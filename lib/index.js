"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const releasing_1 = require("./releasing/");
const releasing_2 = require("./releasing/");
const upserting_1 = require("./upserting/");
const assert_1 = __importDefault(require("assert"));
const zenodraft_1 = __importDefault(require("zenodraft"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        core.startGroup('processing user input');
        const collection_id = core.getInput('collection');
        const compression = core.getInput('compression');
        const filenames = core.getInput('filenames');
        const metadata = core.getInput('metadata');
        const publish = core.getInput('publish') === 'true' ? true : false;
        const sandbox = core.getInput('sandbox') === 'false' ? false : true;
        const upsert_doi = core.getInput('upsert-doi') === 'true' ? true : false;
        const upsert_location = core.getInput('upsert-location');
        const verbose = core.getInput('verbose') === 'true' ? true : false;
        assert_1.default(['tar.gz', 'zip'].includes(compression), 'Invalid value for input argument \'compression\'.');
        assert_1.default((new RegExp('[0-9]+')).test(collection_id) || collection_id === '', 'Invalid value for input argument \'collection\'.');
        core.endGroup();
        // calling this next function will throw if the triggering event is unsupported
        core.startGroup('payload');
        const payload = yield releasing_1.get_payload(metadata);
        core.endGroup();
        // create the deposition as a new version in a new collection or
        // as a new version in an existing collection:
        core.startGroup(`creating deposition on ${sandbox === true ? 'Zenodo Sandbox' : 'Zenodo'}`);
        let latest_id;
        if (collection_id === '') {
            latest_id = yield zenodraft_1.default.deposition_create_in_new_collection(sandbox, verbose);
        }
        else {
            latest_id = yield zenodraft_1.default.deposition_create_in_existing_collection(sandbox, collection_id, verbose);
        }
        core.endGroup();
        if (upsert_doi === true) {
            core.startGroup('upserting doi');
            const prereserved_doi = yield zenodraft_1.default.deposition_show_prereserved(sandbox, latest_id, verbose);
            upserting_1.upsert_prereserved_doi(upsert_location, prereserved_doi);
            core.endGroup();
        }
        core.startGroup('adding files');
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
        core.endGroup();
        // update the metadata if the user has specified a filename that contains metadata
        if (metadata !== '') {
            core.startGroup('adding metadata');
            yield zenodraft_1.default.metadata_update(sandbox, latest_id, metadata, verbose);
            core.endGroup();
        }
        if (publish === true) {
            core.startGroup('publishing');
            yield zenodraft_1.default.deposition_publish(sandbox, latest_id, verbose);
            core.endGroup();
        }
        yield releasing_2.update_github_state(payload, upsert_doi, metadata);
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
exports.main = main;
exports.main();
