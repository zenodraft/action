import { AssertionError } from 'assert'
import { CffObject } from './types'
import { has_cff_version_key } from './has_cff_version_key'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import assert from 'assert'



export const load_cff_file = (): CffObject => {
    let cffstr: string
    try {
        cffstr = fs.readFileSync('CITATION.cff', 'utf8')
    } catch (err) {
        if (err.code === 'ENOENT') {
            // tell user file doesnt exist
            throw new AssertionError({message: 'File CITATION.cff doesn\'t exist.'})
        }
        throw err
    }

    let doc: any
    try {
        doc = yaml.load(cffstr)
    } catch (err) {
        if (err instanceof yaml.YAMLException ) {
            // tell user problem was yaml parsing
            throw new AssertionError({message: 'Could not parse the contents of CITATION.cff as YAML. Try https://yamllint.com to fix the problem.'})
        }
        throw err
    }
    assert(
        typeof(doc) === 'object',
        'Could not parse the contents of CITATION.cff into an object.'
    )
    assert(
        has_cff_version_key(doc),
        'CITATION.cff is missing required key \'cff-version\'.'
    )
    return doc as CffObject
}
