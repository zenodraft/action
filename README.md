# `zenodraft/action@0.7.0` PRERELEASE

Automates drafting depositions on Zenodo or Zenodo Sandbox.

## Features

1. Choose which platform you want to draft your deposition on (Zenodo or Zenodo Sandbox), and easily switch between them (see input argument `sandbox`)
2. Choose to create your draft deposition as a new version in an existing collection, or as a new deposition in a new collection (see input argument `collection`)
3. Choose to finalize the deposition as part of the automation, or leave the deposition as draft for you to inspect and publish manually by clicking the button on Zenodo or Zenodo Sandbox (see input argument `publish`)
4. Publish a snapshot of the repository as a zip or tar.gz (see input argument `compression`)
5. Instead of publishing a snapshot, select a subset of files to publish (see input argument `filenames`)
6. Automatically attach metadata such as title, authors, and contributors to your deposition using information from a file in your repository (see input argument `metadata`)

## Example workflow

Creates a draft snapshot of your repository contents as a new version in collection `1234567` on Zenodo Sandbox using metadata from repository file `.zenodo.json`.

```yaml
name: zenodraft
on:
  workflow_dispatch:
  # workflow-dispatch allows for triggering the workflow
  # manually via the Actions tab

jobs:

  publish:
      runs-on: ubuntu-latest
      steps:
        - name: checkout
          uses: actions/checkout@v2      
        - name: Create a draft snapshot of your repository contents as a new
                version in collection 1234567 on Zenodo Sandbox using metadata
                from repository file .zenodo.json
          env:
            ZENODO_SANDBOX_ACCESS_TOKEN: ${{ secrets.ZENODO_SANDBOX_ACCESS_TOKEN }}
          uses: zenodraft/action@0.7.0
          with:
            collection: 1234567
            metadata: .zenodo.json
            publish: false
            sandbox: true
```

## Input parameters

| parameter name | default value | description |
| :-- | :-- | :-- |
| `collection`  | `''` | By default, the draft is created as a new deposition in a new collection. Alternatively, you can have the new draft appear as a new version in a collection that you own on the target platform by assigning the collection identifier such as `1234567` to `collection`. You can find the collection identifier via Zenodo's frontend as the last part of the DOI listed under _Cite all versions?_ in the sidebar. |
| `compression` | `zip` | Which compression to use when making a snapshot of the entire repository (Valid options are `zip` or `tar.gz`; precludes use of argument `filenames`) |
| `filenames`| `''` | List of space-separated filenames that should be uploaded separately instead of the default behavior of uploading a snapshot of the entire repository as an archive (precludes use of argument compression). |
| `metadata`  | `''` | Used to specify which repository file holds the metadata to be associated with the deposition. The metadata file should be a valid JSON file in Zenodo metadata format. |
| `publish`  | `false` | Whether to automate finalizing the draft deposition as part of the automation, or to leave it to the user to click `Publish` manually after inspecting the draft deposition on the respective platform. |
| `sandbox`  | `true` | Whether to create the draft deposition on Zenodo (production) or Zenodo Sandbox (testing and development). |


## Access tokens & repository secrets

To use `zenodraft/action`, a personal access token is required, one for each platform you plan on using (Zenodo Sandbox, Zenodo).
`zenodraft/action` looks for the access token in the environment variables named
`ZENODO_SANDBOX_ACCESS_TOKEN` and `ZENODO_ACCESS_TOKEN`. The example workflow above shows that these
variables are assigned their value from the repository's secrets. Visit Zenodo Sandbox (https://sandbox.zenodo.org/account/settings/applications/) and/or
Zenodo (https://zenodo.org/account/settings/applications/) to create your own tokens, then go to [https://github.com/&lt;organization name&gt;/&lt;repository name&gt;/settings/secrets/actions](https://github.com/%3Corganization%20name%3E/%3Crepository%20name%3E/settings/secrets/actions) to set your repository secret.
