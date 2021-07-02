import { WorkflowDispatchEvent, ReleaseEvent, ReleasePublishedEvent } from '@octokit/webhooks-definitions/schema'
import * as core from '@actions/core'
import * as github from '@actions/github'
import assert from 'assert'

// ReleaseCreatedEvent triggers on saving a draft - not good
// ReleasePublishedEvent triggers on ...

type Payload = {
    event: 'WorkflowDispatch'
    contents: WorkflowDispatchEvent
} | {
    event: 'ReleasePublished'
    contents: ReleasePublishedEvent
}



const create_github_release = (payload: WorkflowDispatchEvent): void => {
    const github_token = process.env.GITHUB_TOKEN
    assert(github_token !== undefined, 'I don\'t see the GITHUB_TOKEN in the environment.')
    const octokit = github.getOctokit(github_token)

    const [owner, repo] = payload.repository.full_name.split('/').slice(0, 2)
    const tag_name = get_version_from_zenodo_metadata()
    const options = {
        name: tag_name,
        body: 'zenodraft automated release triggered by workflow_dispatch event'
    }
    octokit.rest.repos.createRelease({owner, repo, tag_name, ...options})
    // determine what the tag value should be
    // determine what sha is going to be released
    // create the tag for the sha
    // create the release
}



export const get_payload = (): Payload  => {
    core.group('payload', async () => {core.info(JSON.stringify(github.context.payload, null, 4))})
    if (github.context.eventName === 'workflow_dispatch') {
        return {
            event: 'WorkflowDispatch',
            contents: github.context.payload as WorkflowDispatchEvent
        }
    }

    if (github.context.eventName === 'release') {
        let payload = github.context.payload as ReleaseEvent
        if (payload.action === 'published') {
            return {
                event: 'ReleasePublished',
                contents: payload as ReleasePublishedEvent
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



const get_version_from_zenodo_metadata = (): string => {
    core.info('releasing.ts :: get_version_from_zenodo_metadata(), not implemented yet')
    return '0.0.6'
}



const move_git_tag = (payload: ReleasePublishedEvent): void => {
    core.info('releasing.ts :: move_git_tag(), not implemented yet')
    // get the tag from the release
    // const tag_name = payload.release.tag_name
}



export const update_github_state = (payload: Payload) => {
    if (payload.event === 'ReleasePublished') {
        move_git_tag(payload.contents)
    } else if (payload.event === 'WorkflowDispatch') {
        create_github_release(payload.contents)
    } else {
        throw new Error(`Unsupported event: "${github.context.eventName}".`)
    }
}
