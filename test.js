import { test } from 'node:test'
import assert from 'node:assert'
import { createMockServer, createMockServerWithHandler } from 'ghutils/test-util'
import * as ghrepos from './ghrepos.js'

test('list repos for user', async () => {
  const auth = { token: 'test-token' }
  const testData = [{ id: 1, name: 'repo1' }, { id: 2, name: 'repo2' }]

  const server = await createMockServer({ response: testData })
  try {
    const results = await ghrepos.listUser(auth, 'testuser', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, testData)
    assert.ok(server.requests[0].url.includes('/users/testuser/repos'))
    assert.strictEqual(server.requests[0].headers.authorization, 'Bearer test-token')
  } finally {
    await server.close()
  }
})

test('list repos for authed user (no user arg)', async () => {
  const auth = { token: 'test-token' }
  const testData = [{ id: 1, name: 'repo1' }]

  const server = await createMockServer({ response: testData })
  try {
    const results = await ghrepos.listUser(auth, null, {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, testData)
    assert.ok(server.requests[0].url.includes('/user/repos'))
  } finally {
    await server.close()
  }
})

test('list repos for org', async () => {
  const auth = { token: 'test-token' }
  const testData = [{ id: 1, name: 'repo1' }]

  const server = await createMockServer({ response: testData })
  try {
    const results = await ghrepos.listOrg(auth, 'testorg', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, testData)
    assert.ok(server.requests[0].url.includes('/orgs/testorg/repos'))
  } finally {
    await server.close()
  }
})

test('list repos with pagination', async () => {
  const auth = { token: 'test-token' }
  const page1 = [{ id: 1 }, { id: 2 }]
  const page2 = [{ id: 3 }, { id: 4 }]

  let requestCount = 0
  const mock = await createMockServerWithHandler((req, res) => {
    requestCount++
    const port = mock.address().port
    if (requestCount === 1) {
      res.setHeader('link', `<http://127.0.0.1:${port}/page2>; rel="next"`)
      res.end(JSON.stringify(page1))
    } else {
      res.end(JSON.stringify(page2))
    }
  })

  try {
    const results = await ghrepos.listUser(auth, 'testuser', {
      _apiUrl: mock.baseUrl
    })
    assert.deepStrictEqual(results, [...page1, ...page2])
    assert.strictEqual(requestCount, 2)
  } finally {
    await mock.close()
  }
})

test('list refs', async () => {
  const auth = { token: 'test-token' }
  const refs = [{ ref: 'refs/heads/main' }, { ref: 'refs/tags/v1' }]

  const server = await createMockServer({ response: refs })
  try {
    const results = await ghrepos.listRefs(auth, 'testorg', 'testrepo', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, refs)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/git/refs'))
  } finally {
    await server.close()
  }
})

test('list tags', async () => {
  const auth = { token: 'test-token' }
  const tags = [{ name: 'v1.0.0' }, { name: 'v2.0.0' }]

  const server = await createMockServer({ response: tags })
  try {
    const results = await ghrepos.listTags(auth, 'testorg', 'testrepo', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, tags)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/tags'))
  } finally {
    await server.close()
  }
})

test('list branches', async () => {
  const auth = { token: 'test-token' }
  const branches = [{ name: 'main' }, { name: 'dev' }]

  const server = await createMockServer({ response: branches })
  try {
    const results = await ghrepos.listBranches(auth, 'testorg', 'testrepo', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, branches)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/branches'))
  } finally {
    await server.close()
  }
})

test('list commits', async () => {
  const auth = { token: 'test-token' }
  const commits = [{ sha: 'abc123' }, { sha: 'def456' }]

  const server = await createMockServer({ response: commits })
  try {
    const results = await ghrepos.listCommits(auth, 'testorg', 'testrepo', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, commits)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/commits'))
  } finally {
    await server.close()
  }
})

test('get ref', async () => {
  const auth = { token: 'test-token' }
  const refData = { ref: 'refs/heads/main', object: { sha: 'abc123' } }

  const server = await createMockServer({ response: refData })
  try {
    const result = await ghrepos.getRef(auth, 'testorg', 'testrepo', 'heads/main', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(result, refData)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/git/refs/heads/main'))
  } finally {
    await server.close()
  }
})

test('get ref strips refs/ prefix', async () => {
  const auth = { token: 'test-token' }
  const refData = { ref: 'refs/heads/main' }

  const server = await createMockServer({ response: refData })
  try {
    await ghrepos.getRef(auth, 'testorg', 'testrepo', 'refs/heads/main', {
      _apiUrl: server.baseUrl
    })
    assert.ok(server.requests[0].url.includes('/git/refs/heads/main'))
    assert.ok(!server.requests[0].url.includes('/git/refs/refs/'))
  } finally {
    await server.close()
  }
})

test('get branch', async () => {
  const auth = { token: 'test-token' }
  const branchData = { name: 'main', commit: { sha: 'abc123' } }

  const server = await createMockServer({ response: branchData })
  try {
    const result = await ghrepos.getBranch(auth, 'testorg', 'testrepo', 'main', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(result, branchData)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/branches/main'))
  } finally {
    await server.close()
  }
})

test('get commit', async () => {
  const auth = { token: 'test-token' }
  const commitData = { sha: 'abc123', author: { login: 'testuser' } }

  const server = await createMockServer({ response: commitData })
  try {
    const result = await ghrepos.getCommit(auth, 'testorg', 'testrepo', 'abc123', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(result, commitData)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/commits/abc123'))
  } finally {
    await server.close()
  }
})

test('get commit comments', async () => {
  const auth = { token: 'test-token' }
  const comments = [{ id: 1, body: 'nice' }]

  const server = await createMockServer({ response: comments })
  try {
    const result = await ghrepos.getCommitComments(auth, 'testorg', 'testrepo', 'abc123', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(result, comments)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/commits/abc123/comments'))
  } finally {
    await server.close()
  }
})

test('createLister produces working lister', async () => {
  const auth = { token: 'test-token' }
  const data = [{ id: 1 }, { id: 2 }]
  const customLister = ghrepos.createLister('footype')

  const server = await createMockServer({ response: data })
  try {
    const results = await customLister(auth, 'testorg', 'testrepo', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, data)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/footype'))
  } finally {
    await server.close()
  }
})

test('baseUrl returns correct URL', () => {
  const url = ghrepos.baseUrl('myorg', 'myrepo')
  assert.strictEqual(url, 'https://api.github.com/repos/myorg/myrepo')
})

test('baseUrl respects _apiUrl option', () => {
  const url = ghrepos.baseUrl('myorg', 'myrepo', { _apiUrl: 'http://localhost:3000' })
  assert.strictEqual(url, 'http://localhost:3000/repos/myorg/myrepo')
})
