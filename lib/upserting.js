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
exports.upsert_prereserved_doi = void 0;
const assert_1 = require("assert");
const exec_1 = require("@actions/exec");
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const github = __importStar(require("@actions/github"));
const yaml = __importStar(require("js-yaml"));
const assert_2 = __importDefault(require("assert"));
const create_github_release = (payload) => {
    core.info(JSON.stringify(payload, null, 4));
    const github_token = core.getInput('github_token');
    const octokit = github.getOctokit(github_token);
    console.info(octokit);
    // determine what the tag value should be
    // determine what sha is going to be released
    // create the tag for the sha
    // create the release
};
const has_cff_version_key = (cff) => {
    return Object.keys(cff).includes('cff-version');
};
const load_cff_file = () => {
    let cffstr;
    try {
        cffstr = fs.readFileSync('CITATION.cff', 'utf8');
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            // tell user file doesnt exist
            throw new assert_1.AssertionError({ message: 'File CITATION.cff doesn\'t exist.' });
        }
        throw err;
    }
    let doc;
    try {
        doc = yaml.load(cffstr);
    }
    catch (err) {
        if (err instanceof yaml.YAMLException) {
            // tell user problem was yaml parsing
            throw new assert_1.AssertionError({ message: 'Could not parse the contents of CITATION.cff as YAML. Try https://yamllint.com to fix the problem.' });
        }
        throw err;
    }
    assert_2.default(typeof (doc) === 'object', 'Could not parse the contents of CITATION.cff into an object.');
    assert_2.default(has_cff_version_key(doc), 'CITATION.cff is missing required key \'cff-version\'.');
    return doc;
};
const push_changes_from_upsert = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exec_1.exec('git', ['config', 'user.email', '']);
    yield exec_1.exec('git', ['config', 'user.name', 'zenodraft/action']);
    yield exec_1.exec('git', ['add', 'CITATION.cff']);
    yield exec_1.exec('git', ['commit', '-m', 'zenodraft/action updated the file CITATION.cff with the prereserved doi']);
    yield exec_1.exec('git', ['push']);
});
const get_payload = () => {
    if (github.context.eventName === 'workflow_dispatch') {
        return {
            event: 'workflow_dispatch',
            contents: github.context.payload
        };
    }
    if (github.context.eventName === 'release') {
        const release_event_payload = github.context.payload;
        if (release_event_payload.action === 'published') {
            return {
                event: 'release_published',
                contents: release_event_payload
            };
        }
        else {
            const msg = `Unsupported type of release event: "${release_event_payload.action}".`;
            core.setFailed(msg);
            throw new Error(msg);
        }
    }
    const msg = `Unsupported event: "${github.context.eventName}".`;
    core.setFailed(msg);
    throw new Error(msg);
};
const move_git_tag = (payload) => {
    core.info(JSON.stringify(payload, null, 4));
    // get the tag from the release
    // const tag_name = payload.release.tag_name
};
const supports_identifiers_description_key = (cff) => {
    const cff_version = cff['cff-version'] || '';
    const versions = ['1.2.0'];
    return versions.includes(cff_version);
};
const supports_identifiers_key = (cff) => {
    const cff_version = cff['cff-version'] || '';
    const versions = ['1.1.0', '1.2.0'];
    return versions.includes(cff_version);
};
const upsert_prereserved_doi = (upsert_location, prereserved_doi) => __awaiter(void 0, void 0, void 0, function* () {
    const cff = load_cff_file();
    if (upsert_location === 'identifiers') {
        upsert_location = 'identifiers[0]';
    }
    const identifiers_regex = new RegExp('^identifiers\\[\\d+\\]$');
    if (upsert_location === 'doi') {
        cff.doi = prereserved_doi;
    }
    else if (identifiers_regex.test(upsert_location)) {
        assert_2.default(supports_identifiers_key(cff), `Your CITATION.cff file does not support key \'identifiers\'. Consider updating its \'cff-version\' value.`);
        let obj;
        if (supports_identifiers_description_key(cff)) {
            obj = {
                description: 'Version doi for this work.',
                value: prereserved_doi,
                type: 'doi'
            };
        }
        else {
            obj = {
                value: prereserved_doi,
                type: 'doi'
            };
        }
        const index = parseInt(upsert_location.split(new RegExp('[\\[\\]]'))[1]);
        if (Object.keys(cff).includes('identifiers')) {
            assert_2.default(cff.identifiers instanceof Array, 'Expected \'identifiers\' to be of type Array.');
            assert_2.default(0 <= index && index <= cff.identifiers.length, 'Invalid upsert location index.');
            if (index < cff.identifiers.length) {
                // partially overwrite existing object
                cff.identifiers[index].value = prereserved_doi;
            }
            else {
                // append object to the end of existing identifiers array
                cff.identifiers.push(obj);
            }
        }
        else {
            assert_2.default(index === 0, 'Invalid upsert location index.');
            cff.identifiers = [obj];
        }
    }
    else {
        throw new assert_1.AssertionError({ message: 'Invalid value for variable \'upsert-location\'.' });
    }
    write_cff_file(cff);
    yield push_changes_from_upsert();
    const payload = get_payload();
    if (payload.event === 'release_published') {
        move_git_tag(payload.contents);
    }
    else if (payload.event === 'workflow_dispatch') {
        create_github_release(payload.contents);
    }
    else {
        throw new Error(`Unsupported event: "${github.context.eventName}".`);
    }
});
exports.upsert_prereserved_doi = upsert_prereserved_doi;
const write_cff_file = (cff) => {
    let cffstr = yaml.dump(cff, { sortKeys: false });
    // replace full precision dates with just YYYY-MM-DD before writing to file
    const regexes = [
        new RegExp('(?<k>date-accessed): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-downloaded): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-published): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-released): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-end): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-start): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g')
    ];
    for (const regex of regexes) {
        cffstr = cffstr.replace(regex, '$<k>: $<v>');
    }
    fs.writeFileSync('CITATION.cff', cffstr, 'utf8');
    return;
};
