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
Object.defineProperty(exports, "__esModule", { value: true });
const upserting_1 = require("../../../../src/upserting");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const assert_1 = require("assert");
let temporary_directory;
beforeEach(() => {
    const src = (f) => {
        return path.join(__dirname, f);
    };
    const dest = (f) => {
        return path.join(temporary_directory, f);
    };
    temporary_directory = fs.mkdtempSync(`${os.tmpdir()}${path.sep}zenodraft-action-testing.`);
    fs.copyFileSync(src('CITATION.cff'), dest('CITATION.cff'));
    process.chdir(temporary_directory);
});
test('upserting a doi', () => {
    const upsert_location = 'identifiers[0]';
    const prereserved_doi = '10.5281/upserted.1234567';
    const throwfun = () => {
        upserting_1.upsert_prereserved_doi(upsert_location, prereserved_doi);
    };
    expect(throwfun).toThrow(assert_1.AssertionError);
    try {
        throwfun();
    }
    catch (err) {
        expect(err.message).toBe('Your CITATION.cff file does not support key \'identifiers\'. Consider updating its \'cff-version\' value.');
    }
});
afterEach(() => {
    fs.rmdirSync(temporary_directory, { recursive: true });
});
