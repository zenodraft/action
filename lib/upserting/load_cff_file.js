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
exports.load_cff_file = void 0;
const assert_1 = require("assert");
const has_cff_version_key_1 = require("./has_cff_version_key");
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
const assert_2 = __importDefault(require("assert"));
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
    assert_2.default(has_cff_version_key_1.has_cff_version_key(doc), 'CITATION.cff is missing required key \'cff-version\'.');
    return doc;
};
exports.load_cff_file = load_cff_file;
