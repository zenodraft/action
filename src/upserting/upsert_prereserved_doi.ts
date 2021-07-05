import { AssertionError } from 'assert'
import { Identifier } from './types'
import { load_cff_file } from '../upserting/load_cff_file'
import { supports_identifiers_description_key } from './supports_identifiers_description_key'
import { supports_identifiers_key } from './supports_identifiers_key'
import { write_cff_file } from '../upserting/write_cff_file'
import assert from 'assert'



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
}
