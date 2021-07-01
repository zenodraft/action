import { AssertionError } from 'assert'
import { exec } from '@actions/exec'
import { WorkflowDispatchEvent, ReleaseEvent, ReleasePublishedEvent } from '@octokit/webhooks-definitions/schema'
import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import * as yaml from 'js-yaml'
import assert from 'assert'



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


type Payload = {
    event: 'workflow_dispatch'
    contents: WorkflowDispatchEvent
} | {
    event: 'release_published'
    contents: ReleasePublishedEvent
}



const create_github_release = (payload: WorkflowDispatchEvent): void => {
    core.info(JSON.stringify(payload, null, 4))
    const github_token = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(github_token)
    console.info(octokit)
    // determine what the tag value should be
    // determine what sha is going to be released
    // create the tag for the sha
    // create the release

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



const push_changes_from_upsert = async (): Promise<void> => {
    await exec('git', ['config', 'user.email', ''])
    await exec('git', ['config', 'user.name', 'zenodraft/action'])
    await exec('git', ['add', 'CITATION.cff'])
    await exec('git', ['commit', '-m', 'zenodraft/action updated the file CITATION.cff with the prereserved doi'])
    await exec('git', ['push'])
}



const get_payload = (): Payload  => {

    if (github.context.eventName === 'workflow_dispatch') {
        return {
            event: 'workflow_dispatch',
            contents: github.context.payload as WorkflowDispatchEvent
        }
    }

    if (github.context.eventName === 'release') {
        const release_event_payload = github.context.payload as ReleaseEvent
        if (release_event_payload.action === 'published') {
            return {
                event: 'release_published',
                contents: release_event_payload as ReleasePublishedEvent
            }
        } else {
            const msg = `Unsupported type of release event: "${release_event_payload.action}".`
            core.setFailed(msg)
            throw new Error(msg)
        }
    }
    const msg = `Unsupported event: "${github.context.eventName}".`
    core.setFailed(msg)
    throw new Error(msg)
}



const move_git_tag = (payload: ReleasePublishedEvent): void => {
    core.info(JSON.stringify(payload, null, 4))
    // get the tag from the release
    // const tag_name = payload.release.tag_name

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



export const upsert_prereserved_doi = async (upsert_location: string, prereserved_doi: string): Promise<void> => {

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
    await push_changes_from_upsert()

    const payload = get_payload()
    if (payload.event === 'release_published') {
        move_git_tag(payload.contents)
    } else if (payload.event === 'workflow_dispatch') {
        create_github_release(payload.contents)
    } else {
        throw new Error(`Unsupported event: "${github.context.eventName}".`)
    }
}



const write_cff_file = (cff: CffObject): void => {
    let cffstr = yaml.dump(cff, { sortKeys: false })
    // replace full precision dates with just YYYY-MM-DD before writing to file
    const regexes = [
        new RegExp('(?<k>date-accessed): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-downloaded): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-published): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-released): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-end): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-start): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g')
    ]
    for (const regex of regexes) {
        cffstr = cffstr.replace(regex, '$<k>: $<v>')
    }
    fs.writeFileSync('CITATION.cff', cffstr, 'utf8')
    return
}
