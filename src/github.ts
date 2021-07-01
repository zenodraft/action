import * as core from '@actions/core'
import * as github from '@actions/github'
import { WorkflowDispatchEvent, ReleaseEvent, ReleasePublishedEvent } from '@octokit/webhooks-definitions/schema'


export const show_github_payload = (): void => {

    if (github.context.eventName === 'workflow_dispatch') {
        const payload = github.context.payload as WorkflowDispatchEvent
        workflow_dispatch_eventhandler(payload)
        return
    }

    if (github.context.eventName === 'release') {
        const release_event_payload = github.context.payload as ReleaseEvent
        if (release_event_payload.action === 'published') {
            released_published_eventhandler(release_event_payload as ReleasePublishedEvent)
            return
        } else {
            core.setFailed(`Unsupported type of release event: ${release_event_payload.action}`)
            return
        }
    }
    core.setFailed(`Unsupported event: ${github.context.eventName}`)
    return
}


const released_published_eventhandler = (payload: ReleasePublishedEvent): void => {
    core.info(JSON.stringify(payload, null, 4))
}


const workflow_dispatch_eventhandler = (payload: WorkflowDispatchEvent): void => {
    core.info(JSON.stringify(payload, null, 4))
}
