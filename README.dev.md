# Developer documentation

## Making a release

### preparation


Check version numbers in `README.md`, `package.json`, `package-lock.json`.

In your regular working directory

```shell
git checkout main
git fetch origin
git pull origin main
rm -rf node_modules
npm install --production
git status
## if there are any changes,
#  git add node_modules --force
#  git commit -m "production dependencies only"
npm install
npm run all
git status
## if there are any changes
# git add thefiles
# git commit -m "changes"
# git push origin main
```

On GitHub, run test actions if need be. Then

```shell
# cd to a clean directory
cd $(mktemp -d --tmpdir zenodraft.XXXXXX)

# checkout default branch from remote
git clone https://github.com/zenodraft/action .

git status

# There shouldn't be any local changes
```

### GitHub

Go to https://github.com/zenodraft/action/releases/new to make the new release.

