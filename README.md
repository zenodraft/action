# `zenodraft/action@0.7.0`

Automates drafting depositions on Zenodo or Zenodo Sandbox.

## Features

1. Choose which platform you want to draft your deposition on (Zenodo or Zenodo Sandbox), and easily switch between them
2. Choose to publish as a new version in an existing collection, or as a new deposition in a new collection
3. Choose to finalize the deposition as part of the automation, or leave the deposition as draft for you to inspect and publish manually by clicking the button on Zenodo or Zenodo Sandbox
4. Publish a snapshot of the repository as a zip or tar.gz
5. Instead of publishing a snapshot, select a subset of files to publish
6. Automatically attach metadata such as title, authors, and constributors to your deposition using information from a file in your repository

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
| `metadata`  | `''` | Used to specify which repository file holds the metadata to be associated with the deposition. The metadata file should be a valid JSON file in Zenodo metadata format. |
| `publish`  | `false` | Whether to automate finalizing the draft deposition as part of the automation, or to leave it to the user to click `Publish` manually after inspecting the draft deposition on the respective platform. |
| `sandbox`  | `true` | Whether to create the draft deposition on Zenodo (production) or Zenodo Sandbox (testing and development). |

