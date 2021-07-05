"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supports_identifiers_key = void 0;
const supports_identifiers_key = (cff) => {
    const cff_version = cff['cff-version'] || '';
    const versions = ['1.1.0', '1.2.0'];
    return versions.includes(cff_version);
};
exports.supports_identifiers_key = supports_identifiers_key;
