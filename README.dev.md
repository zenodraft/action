# Developer documentation

## Making a release

### preparation


check version numbers in README.md

In your regular working directory

```shell
git checkout main
git fetch origin
git pull origin main
rm -rf node_modules
npm install --production
git add node_modules --force
git commit -m "production dependencies only"
git push 
```

On GitHub, run test actions if need be. Then

```shell
# cd to a clean directory
cd $(mktemp -d --tmpdir zenodraft.XXXXXX)

# checkout default branch from remote
git clone https://github.com/zenodraft/action .

# install dependencies (production only)
npm install --production

# transpile
npm run all

# If there aren't any local changes, stay in this directory and proceed with the release on GitHub
```

### GitHub

Go to https://github.com/zenodraft/action/releases/new to make the new release.

### npm

```shell
# login if need be
npm login

# FINAL STEP: publish to the world
npm publish
```
