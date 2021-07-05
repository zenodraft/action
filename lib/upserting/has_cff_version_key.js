"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.has_cff_version_key = void 0;
const has_cff_version_key = (cff) => {
    return Object.keys(cff).includes('cff-version');
};
exports.has_cff_version_key = has_cff_version_key;
