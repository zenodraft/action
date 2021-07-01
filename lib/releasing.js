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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_github_state = exports.get_payload = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const assert_1 = __importDefault(require("assert"));
const create_github_release = (payload) => {
    core.info(JSON.stringify(payload, null, 4));
    const github_token = process.env.GITHUB_TOKEN;
    assert_1.default(github_token !== undefined, 'I don\'t see the GITHUB_TOKEN in the environment.');
    const octokit = github.getOctokit(github_token);
    const [owner, repo] = payload.repository.full_name.split('/').slice(0, 2);
    const tag_name = get_version_from_zenodo_metadata();
    const options = {
        name: tag_name,
        body: 'zenodraft automated release triggered by workflow_dispatch event'
    };
    octokit.rest.repos.createRelease(Object.assign({ owner, repo, tag_name }, options));
    // determine what the tag value should be
    // determine what sha is going to be released
    // create the tag for the sha
    // create the release
};
const get_payload = () => {
    if (github.context.eventName === 'workflow_dispatch') {
        return {
            event: 'workflow_dispatch',
            contents: github.context.payload
        };
    }
    if (github.context.eventName === 'release') {
        const release_event_payload = github.context.payload;
        if (release_event_payload.action === 'created') {
            return {
                event: 'release_created',
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
exports.get_payload = get_payload;
const get_version_from_zenodo_metadata = () => {
    return '0.0.6';
};
const move_git_tag = (payload) => {
    core.info(JSON.stringify(payload, null, 4));
    // get the tag from the release
    // const tag_name = payload.release.tag_name
};
const update_github_state = () => {
    const payload = exports.get_payload();
    if (payload.event === 'release_created') {
        move_git_tag(payload.contents);
    }
    else if (payload.event === 'workflow_dispatch') {
        create_github_release(payload.contents);
    }
    else {
        throw new Error(`Unsupported event: "${github.context.eventName}".`);
    }
};
exports.update_github_state = update_github_state;
