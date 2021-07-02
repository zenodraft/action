import { WorkflowDispatchEvent, ReleaseEvent, ReleaseCreatedEvent } from '@octokit/webhooks-definitions/schema'
import * as core from '@actions/core'
import * as github from '@actions/github'
import assert from 'assert'



type Payload = {
    event: 'WorkflowDispatch'
    contents: WorkflowDispatchEvent
} | {
    event: 'ReleaseCreated'
    contents: ReleaseCreatedEvent
}



const create_github_release = (payload: WorkflowDispatchEvent): void => {
    core.group('WorkflowDispatchEvent payload', async () => {core.info(JSON.stringify(payload, null, 4))})
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

    if (github.context.eventName === 'workflow_dispatch') {
        return {
            event: 'WorkflowDispatch',
            contents: github.context.payload as WorkflowDispatchEvent
        }
    }

    if (github.context.eventName === 'release') {
        let payload = github.context.payload as ReleaseEvent
        if (payload.action === 'created') {
            return {
                event: 'ReleaseCreated',
                contents: payload as ReleaseCreatedEvent
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



const move_git_tag = (payload: ReleaseCreatedEvent): void => {
    core.info('releasing.ts :: move_git_tag(), not implemented yet')
    core.group('ReleasedEvent payload', async () => {core.info(JSON.stringify(payload, null, 4))})
    // get the tag from the release
    // const tag_name = payload.release.tag_name
}



export const update_github_state = (payload: Payload) => {
    if (payload.event === 'ReleaseCreated') {
        move_git_tag(payload.contents)
    } else if (payload.event === 'WorkflowDispatch') {
        create_github_release(payload.contents)
    } else {
        throw new Error(`Unsupported event: "${github.context.eventName}".`)
    }
}
