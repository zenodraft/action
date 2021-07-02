import { exec } from '@actions/exec'
import { WorkflowDispatchEvent, ReleaseEvent, ReleasePublishedEvent } from '@octokit/webhooks-definitions/schema'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'
import assert from 'assert'
import { load_cff_file } from './upserting'


type WorkflowDispatchPayload = {
    contents: WorkflowDispatchEvent    
    event: 'WorkflowDispatch'
    tag: string
}

type ReleasePublishedPayload = {
    contents: ReleasePublishedEvent
    event: 'ReleasePublished'
    tag: string
}

type Payload = WorkflowDispatchPayload | ReleasePublishedPayload


const get_octokit = () => {
    const github_token = process.env.GITHUB_TOKEN
    assert(github_token !== undefined, 'I don\'t see the GITHUB_TOKEN in the environment.')
    return github.getOctokit(github_token)
}


const create_github_release = async (payload: WorkflowDispatchPayload, upsert_doi: boolean): Promise<void> => {
    const [owner, repo] = payload.contents.repository.full_name.split('/').slice(0, 2)
    const options = {
        name: payload.tag,
        body: 'zenodraft automated release triggered by workflow_dispatch event',
        target_commitish: payload.contents.ref
    }
    if (upsert_doi === true) {
        await core.group('updating the branch with changes that resulted from upserting the prereserved doi', async () => {
            await exec('git', ['config', 'user.email', ''])
            await exec('git', ['config', 'user.name', 'zenodraft/action'])
            await exec('git', ['add', 'CITATION.cff'])
            await exec('git', ['commit', '-m', 'zenodraft/action updated the file CITATION.cff with the prereserved doi'])
            await exec('git', ['push'])
        })
    }
    get_octokit().rest.repos.createRelease({owner, repo, tag_name: payload.tag, ...options})
}



const determine_tag = (filename: string): string => {

    const version_commit = ((): string => {
        return 'qarq3w3'
    })()

    let version_cff: string | undefined
    try {
        version_cff = load_cff_file().version!.toString()
    } catch (err) {
        version_cff = undefined
    }

    let version_zenodo: string | undefined    
    try {
        version_zenodo = JSON.parse(fs.readFileSync(filename, 'utf8')).version!.toString()
    }  catch (err) {
        version_zenodo = undefined
    }

    if (version_zenodo !== undefined && version_cff !== undefined) {
        assert(version_cff === version_zenodo, `Inconsistent versions found in CITATION.cff and ${filename}`)
    }

    if (filename === '') {
        return version_zenodo || version_cff || version_commit
    } else if (filename === 'CITATION.cff') {
        return version_cff || version_commit
    } else {
        return version_zenodo || version_commit
    }
}


export const get_payload = (filename: string): Payload  => {
    core.group('payload', async () => {core.info(JSON.stringify(github.context.payload, null, 4))})
    if (github.context.eventName === 'workflow_dispatch') {
        return {
            contents: github.context.payload as WorkflowDispatchEvent,
            event: 'WorkflowDispatch',            
            tag: determine_tag(filename)
        }
    }

    if (github.context.eventName === 'release') {
        let payload = github.context.payload as ReleaseEvent
        if (payload.action === 'published') {
            return {
                contents: payload as ReleasePublishedEvent,
                event: 'ReleasePublished',
                tag: payload.release.tag_name
            }
        } else {
            const msg = `Unsupported type of release event: "${payload.action}".`
            core.setFailed(msg)
            throw new Error(msg)
        }
    }
    const msg = `Unsupported event: "${github.context.eventName}".`
    core.setFailed(msg)
    throw new Error(msg)
}



const move_git_tag = (payload: ReleasePublishedPayload): void => {
    core.info('releasing.ts :: move_git_tag(), not implemented yet')
    // get the tag from the release
    // const tag_name = payload.release.tag_name
}



export const update_github_state = async (payload: Payload, upsert_doi: boolean) => {
    if (payload.event === 'ReleasePublished') {
        move_git_tag(payload)
    } else if (payload.event === 'WorkflowDispatch') {
        await create_github_release(payload, upsert_doi)
    } else {
        throw new Error(`Unsupported event: "${github.context.eventName}".`)
    }
}
