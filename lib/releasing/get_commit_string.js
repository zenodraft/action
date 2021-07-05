"use strict";
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
exports.get_commit_string = void 0;
const exec_1 = require("@actions/exec");
const get_commit_string = () => __awaiter(void 0, void 0, void 0, function* () {
    let my_stdout = '';
    let my_stderr = '';
    const options = {};
    options.listeners = {
        stdout: (data) => {
            my_stdout += data.toString();
        },
        stderr: (data) => {
            my_stderr += data.toString();
        }
    };
    yield exec_1.exec('git', ['log', '--abbrev-commit', '--max-count', '1'], options);
    const regexp = new RegExp('commit (?<sha>[0-9a-z]{7})[\\s\\S]*');
    return my_stdout.replace(regexp, '$<sha>');
});
exports.get_commit_string = get_commit_string;
