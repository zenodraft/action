import * as github from '@actions/github'
import assert from 'assert'


export const get_octokit = () => {
    const github_token = process.env.GITHUB_TOKEN
    assert(github_token !== undefined, 'I don\'t see the GITHUB_TOKEN in the environment.')
    return github.getOctokit(github_token)
}