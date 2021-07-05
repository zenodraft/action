"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supports_identifiers_description_key = void 0;
const supports_identifiers_description_key = (cff) => {
    const cff_version = cff['cff-version'] || '';
    const versions = ['1.2.0'];
    return versions.includes(cff_version);
};
exports.supports_identifiers_description_key = supports_identifiers_description_key;
