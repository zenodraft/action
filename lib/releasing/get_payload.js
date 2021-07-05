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
exports.get_payload = void 0;
const determine_tag_name_1 = require("./determine_tag_name");
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const get_payload = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    core.group('payload', () => __awaiter(void 0, void 0, void 0, function* () { core.info(JSON.stringify(github.context.payload, null, 4)); }));
    if (github.context.eventName === 'workflow_dispatch') {
        return {
            contents: github.context.payload,
            event: 'WorkflowDispatch',
            tag: yield determine_tag_name_1.determine_tag_name(filename)
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
});
exports.get_payload = get_payload;
