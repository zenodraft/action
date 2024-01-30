import { exec } from '@actions/exec'



export const get_commit_string = async (): Promise<string> => {

    let my_stdout = ''
    let my_stderr = ''

    const options: any = {}
    options.listeners = {
        stdout: (data: Buffer) => {
            my_stdout += data.toString()
        },
        stderr: (data: Buffer) => {
            my_stderr += data.toString()
        }
    }
    await exec('git', ['log', '--abbrev-commit', '--max-count', '1'], options)

    const regexp = new RegExp('commit (?<sha>[0-9a-z]{7})[\\s\\S]*')
    return my_stdout.replace(regexp, '$<sha>')
}
