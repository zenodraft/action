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
exports.determine_tag_name = void 0;
const load_cff_file_1 = require("./../upserting/load_cff_file");
const fs = __importStar(require("fs"));
const assert_1 = __importDefault(require("assert"));
const get_commit_string_1 = require("./get_commit_string");
const determine_tag_name = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const version_commit = yield get_commit_string_1.get_commit_string();
    let version_cff;
    try {
        version_cff = load_cff_file_1.load_cff_file().version.toString();
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
});
exports.determine_tag_name = determine_tag_name;
