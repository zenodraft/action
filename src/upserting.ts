import * as yaml from 'js-yaml'
import * as fs from 'fs'
import assert from 'assert'



type Identifier = {
    type: 'doi' | 'swh' | 'url' | 'other',
    value: string,
    description?: string
}



type Cff = {
    'cff-version'?: string,
    doi?: string,
    identifiers?: Array<Identifier>
}



const has_cff_version_key = (cff: Cff): boolean => {
    return Object.keys(cff).includes('cff-version')
}



const load_cff_file = (): object => {
    const cffstr = fs.readFileSync('CITATION.cff', 'utf8')
    const doc = yaml.load(cffstr)
    assert(
        typeof(doc) === 'object',
        'Could not parse the contents of CITATION.cff into an object.'
    )
    return doc as object
}



const supports_identifiers_description_key = (cff: Cff): boolean => {
    const cff_version = cff['cff-version'] || ''
    const versions = ['1.2.0']
    return versions.includes(cff_version)
}



const supports_identifiers_key = (cff: Cff): boolean => {
    const cff_version = cff['cff-version'] || ''
    const versions = ['1.1.0', '1.2.0']
    return versions.includes(cff_version)
}



export const upsert_prereserved_doi = (upsert_doi: boolean, upsert_location: string, prereserved_doi: string): void => {

    if (upsert_doi === false) {
        return
    }

    let cff: Cff

    try {
        cff = load_cff_file()
    } catch (err) {
        if (err.code === 'ENOENT') {
            // tell user file doesnt exist
            throw new Error('File CITATION.cff doesn\'t exist.')
        }
        if (err instanceof yaml.YAMLException ) {
            // tell user problem was yaml parsing
            throw new Error('Could not parse the contents of CITATION.cff as YAML. Try https://yamllint.com to fix the problem.')
        }
        // other error
        throw err
    }

    assert(
        has_cff_version_key(cff),
        'CITATION.cff is missing required key \'cff-version\'.'
    )

    if (upsert_location === 'identifiers') {
        upsert_location = 'identifiers[0]'
    }

    const identifiers_regex = new RegExp('^identifiers\\[\\d\\]$')

    if (upsert_location === 'doi') {
        cff.doi = prereserved_doi
    } else if (identifiers_regex.test(upsert_location)) {
        assert(
            supports_identifiers_key(cff),
            `Your CITATION.cff file does not support key \'identifiers\'. Consider updating its \'cff-version\' value.`
        )
        const index = parseInt(upsert_location.split(new RegExp('[\\[\\]]'))[1])

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

        if (Object.keys(cff).includes('identifiers') && cff.identifiers instanceof Array) {
            assert(0 <= index && index <= cff.identifiers.length)
            if (index < cff.identifiers.length) {
                // partially overwrite existing object
                cff.identifiers[index].value = prereserved_doi
            } else {
                // append object to the end of existing identifiers array
                cff.identifiers.push(obj)
            }
        } else {
            assert(index === 0)
            cff.identifiers = [obj]
        }
    } else {
        throw new Error('Invalid value for variable \'upsert-location\'.')
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



const write_cff_file = (cff: Cff): void => {
    const cffstr = yaml.dump(cff, { sortKeys: false })
    fs.writeFileSync('CITATION.cff', cffstr, 'utf8')
    return
}
