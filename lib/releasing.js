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
exports.update_github_state = exports.get_payload = void 0;
const exec_1 = require("@actions/exec");
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs = __importStar(require("fs"));
const assert_1 = __importDefault(require("assert"));
const upserting_1 = require("./upserting");
const get_octokit = () => {
    const github_token = process.env.GITHUB_TOKEN;
    assert_1.default(github_token !== undefined, 'I don\'t see the GITHUB_TOKEN in the environment.');
    return github.getOctokit(github_token);
};
const create_github_release = (payload, upsert_doi) => __awaiter(void 0, void 0, void 0, function* () {
    const [owner, repo] = payload.contents.repository.full_name.split('/').slice(0, 2);
    const options = {
        name: payload.tag,
        body: 'zenodraft automated release triggered by workflow_dispatch event',
        target_commitish: payload.contents.ref
    };
    if (upsert_doi === true) {
        yield core.group('updating the branch with changes that resulted from upserting the prereserved doi', () => __awaiter(void 0, void 0, void 0, function* () {
            yield exec_1.exec('git', ['config', 'user.email', '']);
            yield exec_1.exec('git', ['config', 'user.name', 'zenodraft/action']);
            yield exec_1.exec('git', ['add', 'CITATION.cff']);
            yield exec_1.exec('git', ['commit', '-m', 'zenodraft/action updated the file CITATION.cff with the prereserved doi']);
            yield exec_1.exec('git', ['push']);
        }));
    }
    get_octokit().rest.repos.createRelease(Object.assign({ owner, repo, tag_name: payload.tag }, options));
});
const determine_tag = (filename) => {
    const version_commit = (() => {
        return 'qarq3w3';
    })();
    let version_cff;
    try {
        version_cff = upserting_1.load_cff_file().version.toString();
    }
    catch (err) {
        version_cff = undefined;
    }
    let version_zenodo;
    try {
        version_zenodo = JSON.parse(fs.readFileSync(filename, 'utf8')).version.toString();
    }
    catch (err) {
        version_zenodo = undefined;
    }
    if (version_zenodo !== undefined && version_cff !== undefined) {
        assert_1.default(version_cff === version_zenodo, `Inconsistent versions found in CITATION.cff and ${filename}`);
    }
    if (filename === '') {
        return version_zenodo || version_cff || version_commit;
    }
    else if (filename === 'CITATION.cff') {
        return version_cff || version_commit;
    }
    else {
        return version_zenodo || version_commit;
    }
};
const get_payload = (filename) => {
    core.group('payload', () => __awaiter(void 0, void 0, void 0, function* () { core.info(JSON.stringify(github.context.payload, null, 4)); }));
    if (github.context.eventName === 'workflow_dispatch') {
        return {
            contents: github.context.payload,
            event: 'WorkflowDispatch',
            tag: determine_tag(filename)
        };
    }
    if (github.context.eventName === 'release') {
        let payload = github.context.payload;
        if (payload.action === 'published') {
            return {
                contents: payload,
                event: 'ReleasePublished',
                tag: payload.release.tag_name
            };
        }
        else {
            const msg = `Unsupported type of release event: "${payload.action}".`;
            core.setFailed(msg);
            throw new Error(msg);
        }
    }
    const msg = `Unsupported event: "${github.context.eventName}".`;
    core.setFailed(msg);
    throw new Error(msg);
};
exports.get_payload = get_payload;
const move_git_tag = (payload, upsert_doi) => __awaiter(void 0, void 0, void 0, function* () {
    if (upsert_doi === true) {
        // https://gist.github.com/danielestevez/2044589
        const tag_name = payload.contents.release.tag_name;
        const target_commitish = payload.contents.release.target_commitish;
        yield core.group('updating the tag with changes that resulted from upserting the prereserved doi', () => __awaiter(void 0, void 0, void 0, function* () {
            yield exec_1.exec('git', ['config', 'user.email', '']);
            yield exec_1.exec('git', ['config', 'user.name', 'zenodraft/action']);
            yield exec_1.exec('git', ['checkout', target_commitish]);
            yield exec_1.exec('git', ['add', 'CITATION.cff']);
            yield exec_1.exec('git', ['commit', '-m', 'zenodraft/action updated the file CITATION.cff with the prereserved doi']);
            yield exec_1.exec('git', ['tag', '-d', tag_name]);
            yield exec_1.exec('git', ['tag', tag_name]);
            yield exec_1.exec('git', ['push', 'origin', `:${tag_name}`]);
            yield exec_1.exec('git', ['push', 'origin', `${tag_name}`]);
        }));
    }
});
const update_github_state = (payload, upsert_doi) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.event === 'ReleasePublished') {
        yield move_git_tag(payload, upsert_doi);
    }
    else if (payload.event === 'WorkflowDispatch') {
        yield create_github_release(payload, upsert_doi);
    }
    else {
        throw new Error(`Unsupported event: "${github.context.eventName}".`);
    }
});
exports.update_github_state = update_github_state;
