"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsert_prereserved_doi = void 0;
const assert_1 = require("assert");
const load_cff_file_1 = require("../upserting/load_cff_file");
const supports_identifiers_description_key_1 = require("./supports_identifiers_description_key");
const supports_identifiers_key_1 = require("./supports_identifiers_key");
const write_cff_file_1 = require("../upserting/write_cff_file");
const assert_2 = __importDefault(require("assert"));
const upsert_prereserved_doi = (upsert_location, prereserved_doi) => {
    const cff = load_cff_file_1.load_cff_file();
    if (upsert_location === 'identifiers') {
        upsert_location = 'identifiers[0]';
    }
    const identifiers_regex = new RegExp('^identifiers\\[\\d+\\]$');
    if (upsert_location === 'doi') {
        cff.doi = prereserved_doi;
    }
    else if (identifiers_regex.test(upsert_location)) {
        assert_2.default(supports_identifiers_key_1.supports_identifiers_key(cff), `Your CITATION.cff file does not support key \'identifiers\'. Consider updating its \'cff-version\' value.`);
        let obj;
        if (supports_identifiers_description_key_1.supports_identifiers_description_key(cff)) {
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
    write_cff_file_1.write_cff_file(cff);
};
exports.upsert_prereserved_doi = upsert_prereserved_doi;
