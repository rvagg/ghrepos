# ghrepos

**A Node.js library to interact with the GitHub repos API**

[![NPM](https://nodei.co/npm/ghrepos.svg?style=flat&data=n,v&color=blue)](https://nodei.co/npm/ghrepos/)

## Requirements

- Node.js >= 20

## Example usage

```js
import * as ghrepos from 'ghrepos'

const auth = { token: 'your-github-token' }

// list all repos for a user
const repos = await ghrepos.listUser(auth, 'rvagg')
console.log(repos)

// list all repos for an org
const orgRepos = await ghrepos.listOrg(auth, 'nodejs')
console.log(orgRepos)

// get branch data
const branch = await ghrepos.getBranch(auth, 'nodejs', 'node', 'main')
console.log(branch)

// get commit comments
const comments = await ghrepos.getCommitComments(auth, 'nodejs', 'node', '75318e46b')
console.log(comments)
```

The auth data is compatible with [ghauth](https://github.com/rvagg/ghauth) so you can connect them together:

```js
import ghauth from 'ghauth'
import * as ghrepos from 'ghrepos'

const auth = await ghauth({
  configName: 'repo-lister',
  scopes: ['user']
})

const repos = await ghrepos.listUser(auth, 'rvagg')
console.log('Repos for rvagg:')
repos.forEach((r) => {
  console.log('%s: %s (fork: %s)', r.name, r.description, r.fork)
})
```

## API

All methods return Promises.

### ghrepos.listUser(auth, user, options)

List all repos for a user. If `user` is falsy, lists repos for the authenticated user.

### ghrepos.listOrg(auth, org, options)

List all repos for an organisation.

### ghrepos.listRefs(auth, org, repo, options)

Get git ref data for all refs in a repo.

### ghrepos.listTags(auth, org, repo, options)

List git tags for a repo.

### ghrepos.listBranches(auth, org, repo, options)

List git branches for a repo.

### ghrepos.listCommits(auth, org, repo, options)

List git commits for a repo.

### ghrepos.getRef(auth, org, repo, ref, options)

Get git ref data for a particular ref string. The `refs/` prefix is automatically stripped if present.

### ghrepos.getBranch(auth, org, repo, branch, options)

Get git branch data for a given branch name.

### ghrepos.getCommit(auth, org, repo, sha, options)

Get git commit data for a given SHA.

### ghrepos.getCommitComments(auth, org, repo, sha, options)

Get commit comments for a given SHA.

### ghrepos.createLister(type)

Creates a function that lists sub-resources under `/repos/:org/:repo/:type`, e.g. `'issues'`, `'pulls'` or `'releases'`. The returned function has the signature: `async function (auth, org, repo, options)`.

### ghrepos.baseUrl(org, repo, options)

Returns the base API URL for a repo: `https://api.github.com/repos/:org/:repo`.

## Authentication

See [ghauth](https://github.com/rvagg/ghauth) for an easy way to obtain and cache GitHub authentication tokens. The `auth` object returned by ghauth is directly compatible with all ghrepos methods.

## See also

* [ghissues](https://github.com/rvagg/ghissues) - interact with the GitHub issues API
* [ghusers](https://github.com/rvagg/ghusers) - interact with the GitHub users API
* [ghteams](https://github.com/rvagg/ghteams) - interact with the GitHub teams API
* [ghpulls](https://github.com/rvagg/ghpulls) - interact with the GitHub pull requests API
* [ghauth](https://github.com/rvagg/ghauth) - GitHub authentication

## License

**ghrepos** is Copyright (c) 2014-2025 Rod Vagg [@rvagg](https://github.com/rvagg) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.
