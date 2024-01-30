import { upsert_prereserved_doi } from '../../../../../src/upserting/'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'


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
    fs.copyFileSync(src('expected.yml'), dest('expected.yml'))
    process.chdir(temporary_directory)
})


test('upserting a doi',() => {

    const upsert_location = 'identifiers'
    const prereserved_doi = '10.5281/upserted.1234567'

    upsert_prereserved_doi(upsert_location, prereserved_doi)

    const actual = fs.readFileSync('CITATION.cff', 'utf8')
    const expected = fs.readFileSync('expected.yml', 'utf8')
    expect(actual).toEqual(expected);
});


afterEach(() => {
    fs.rmSync(temporary_directory, { recursive: true });
})
