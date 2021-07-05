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
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_github_release = void 0;
const exec_1 = require("@actions/exec");
const get_octokit_1 = require("./get_octokit");
const core = __importStar(require("@actions/core"));
const determine_tag_name_1 = require("./determine_tag_name");
const create_github_release = (payload, upsert_doi, filename) => __awaiter(void 0, void 0, void 0, function* () {
    if (upsert_doi === true) {
        core.startGroup('updating the branch with changes that resulted from upserting the prereserved doi');
        yield exec_1.exec('git', ['config', 'user.email', '']);
        yield exec_1.exec('git', ['config', 'user.name', 'zenodraft/action']);
        yield exec_1.exec('git', ['add', 'CITATION.cff']);
        yield exec_1.exec('git', ['commit', '-m', 'zenodraft/action updated the file CITATION.cff with the prereserved doi']);
        yield exec_1.exec('git', ['push']);
        payload.tag = yield determine_tag_name_1.determine_tag_name(filename);
        core.endGroup();
    }
    core.startGroup('creating the github release');
    const [owner, repo] = payload.contents.repository.full_name.split('/').slice(0, 2);
    const options = {
        name: payload.tag,
        body: 'zenodraft automated release triggered by workflow_dispatch event',
        target_commitish: payload.contents.ref
    };
    get_octokit_1.get_octokit().rest.repos.createRelease(Object.assign({ owner, repo, tag_name: payload.tag }, options));
    core.endGroup();
});
exports.create_github_release = create_github_release;
