import * as yaml from 'js-yaml'
import * as fs from 'fs'
import assert from 'assert'
import { AssertionError } from 'assert'


type Identifier = {
    type: 'doi' | 'swh' | 'url' | 'other',
    value: string,
    description?: string
}



type CffObject = {
    'cff-version': string,
    doi?: string,
    identifiers?: Array<Identifier>
}



const has_cff_version_key = (cff: CffObject): boolean => {
    return Object.keys(cff).includes('cff-version')
}



const load_cff_file = (): CffObject => {
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



const supports_identifiers_description_key = (cff: CffObject): boolean => {
    const cff_version = cff['cff-version'] || ''
    const versions = ['1.2.0']
    return versions.includes(cff_version)
}



const supports_identifiers_key = (cff: CffObject): boolean => {
    const cff_version = cff['cff-version'] || ''
    const versions = ['1.1.0', '1.2.0']
    return versions.includes(cff_version)
}



export const upsert_prereserved_doi = (upsert_location: string, prereserved_doi: string): void => {

    const cff = load_cff_file()

    if (upsert_location === 'identifiers') {
        upsert_location = 'identifiers[0]'
    }

    const identifiers_regex = new RegExp('^identifiers\\[\\d+\\]$')

    if (upsert_location === 'doi') {
        cff.doi = prereserved_doi
    } else if (identifiers_regex.test(upsert_location)) {
        assert(
            supports_identifiers_key(cff),
            `Your CITATION.cff file does not support key \'identifiers\'. Consider updating its \'cff-version\' value.`
        )

        let obj: Identifier
        if (supports_identifiers_description_key(cff)) {
            obj = {
                description: 'Version doi for this work.',
                value: prereserved_doi,
                type: 'doi'
            }
        } else {
            obj = {
                value: prereserved_doi,
                type: 'doi'
            }
        }

        const index = parseInt(upsert_location.split(new RegExp('[\\[\\]]'))[1])
        if (Object.keys(cff).includes('identifiers')) {
            assert(cff.identifiers instanceof Array, 'Expected \'identifiers\' to be of type Array.')
            assert(0 <= index && index <= cff.identifiers.length, 'Invalid upsert location index.')
            if (index < cff.identifiers.length) {
                // partially overwrite existing object
                cff.identifiers[index].value = prereserved_doi
            } else {
                // append object to the end of existing identifiers array
                cff.identifiers.push(obj)
            }
        } else {
            assert(index === 0, 'Invalid upsert location index.')
            cff.identifiers = [obj]
        }
    } else {
        throw new AssertionError({message: 'Invalid value for variable \'upsert-location\'.'})
    }

    write_cff_file(cff)

    // use octokit to do the equivalent of
    // git add CITATION.cff
    // git commit -m "updated the CITATION.cff with prereserved doi"
    // git push 

    // if workflow was triggered by published | created | updated a prerelease | release event:
    // use octokit to
    // move tag to new commit
    // move release to new commit
}



const write_cff_file = (cff: CffObject): void => {
    const cffstr = yaml.dump(cff, { sortKeys: false })
    fs.writeFileSync('CITATION.cff', cffstr, 'utf8')
    return
}