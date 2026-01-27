import { apiRoot, ghget, lister } from 'ghutils'

const defaultApiUrl = apiRoot

export function baseUrl (org, repo, options = {}) {
  const api = options._apiUrl || defaultApiUrl
  return `${api}/repos/${org}/${repo}`
}

export async function listUser (auth, user, options = {}) {
  const api = options._apiUrl || defaultApiUrl
  const url = user ? `${api}/users/${user}/repos` : `${api}/user/repos`
  return lister(auth, url, options)
}

export async function listOrg (auth, org, options = {}) {
  const api = options._apiUrl || defaultApiUrl
  const url = `${api}/orgs/${org}/repos`
  return lister(auth, url, options)
}

export async function listRefs (auth, org, repo, options = {}) {
  const url = baseUrl(org, repo, options) + '/git/refs'
  return lister(auth, url, options)
}

export async function listTags (auth, org, repo, options = {}) {
  const url = baseUrl(org, repo, options) + '/tags'
  return lister(auth, url, options)
}

export async function listBranches (auth, org, repo, options = {}) {
  const url = baseUrl(org, repo, options) + '/branches'
  return lister(auth, url, options)
}

export async function listCommits (auth, org, repo, options = {}) {
  const url = baseUrl(org, repo, options) + '/commits'
  return lister(auth, url, options)
}

export async function getRef (auth, org, repo, ref, options = {}) {
  ref = ref.replace(/^refs\//, '')
  const url = baseUrl(org, repo, options) + '/git/refs/' + ref
  const { data } = await ghget(auth, url, options)
  return data
}

export async function getBranch (auth, org, repo, branch, options = {}) {
  const url = baseUrl(org, repo, options) + '/branches/' + branch
  const { data } = await ghget(auth, url, options)
  return data
}

export async function getCommit (auth, org, repo, sha, options = {}) {
  const url = baseUrl(org, repo, options) + '/commits/' + sha
  const { data } = await ghget(auth, url, options)
  return data
}

export async function getCommitComments (auth, org, repo, sha, options = {}) {
  const url = baseUrl(org, repo, options) + '/commits/' + sha + '/comments'
  const { data } = await ghget(auth, url, options)
  return data
}

export function createLister (type) {
  return async function (auth, org, repo, options = {}) {
    const url = baseUrl(org, repo, options) + '/' + type
    return lister(auth, url, options)
  }
}
