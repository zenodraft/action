import * as core from '@actions/core'
import * as github from '@actions/github'
import { WorkflowDispatchEvent } from '@octokit/webhooks-definitions/schema'


export const show_github_payload = (): void => {
    if (github.context.eventName === 'workflow_dispatch') {
        const payload = github.context.payload as WorkflowDispatchEvent
        core.info(`The payload is: ${payload}`)
    } else {
        core.info('unsupported event')
    }
}
