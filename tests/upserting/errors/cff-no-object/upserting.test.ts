import { upsert_prereserved_doi } from '../../../../src/upserting/upsert_prereserved_doi'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { AssertionError } from 'assert'


let temporary_directory: string;

beforeEach(() => {

    const src = (f: string): string => {
        return path.join(__dirname, f)
    }

    const dest = (f: string): string => {
        return path.join(temporary_directory, f)
    }

    temporary_directory = fs.mkdtempSync(`${os.tmpdir()}${path.sep}zenodraft-action-testing.`)
    fs.copyFileSync(src('CITATION.cff'), dest('CITATION.cff'))
    process.chdir(temporary_directory)
})


test('upserting a doi',() => {

    const upsert_location = 'doi'
    const prereserved_doi = '10.5281/upserted.1234567'

    const throwfun = () => {
        upsert_prereserved_doi(upsert_location, prereserved_doi)
    }
    expect(throwfun).toThrow(AssertionError)
    try {
        throwfun()
    } catch (err) {
        expect(err.message).toBe('Could not parse the contents of CITATION.cff into an object.')
    }
})


afterEach(() => {
    fs.rmdirSync(temporary_directory, { recursive: true });
})
