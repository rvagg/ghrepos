const ghutils = require('ghutils/test')
    , ghrepos = require('./')
    , test    = require('tape')
    , xtend   = require('xtend')


test('test list repos for org/user', function (t) {
  t.plan(10)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , testData = [ [ { test1: 'data1' }, { test2: 'data2' } ], [] ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghrepos.list(xtend(auth), org, ghutils.verifyData(t, testData[0]))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/users/testorg/repos?page=1'
      , 'https://api.github.com/users/testorg/repos?page=2'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test list repos for authed user', function (t) {
  t.plan(10)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , testData = [
          [ { test3: 'data3' }, { test4: 'data4' } ]
        , []
      ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghrepos.list(xtend(auth), ghutils.verifyData(t, testData[0]))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/user/repos?page=1'
      , 'https://api.github.com/user/repos?page=2'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test list repos for authed user with multi-page', function (t) {
  t.plan(13)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , testData = [
          [ { test3: 'data3' }, { test4: 'data4' } ]
        , [ { test5: 'data5' }, { test6: 'data6' } ]
        , []
      ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghrepos.list(xtend(auth), ghutils.verifyData(t, testData[0].concat(testData[1])))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/user/repos?page=1'
      , 'https://api.github.com/user/repos?page=2'
      , 'https://api.github.com/user/repos?page=3'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test list repos for authed user with no repos', function (t) {
  t.plan(7)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , testData = [ [] ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghrepos.list(xtend(auth), ghutils.verifyData(t, []))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/user/repos?page=1'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test get ref for a repo', function (t) {
  t.plan(13)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = [
          [ { test3: 'data3' }, { test4: 'data4' } ]
        , [ { test5: 'data5' }, { test6: 'data6' } ]
        , []
      ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghrepos.listRefs(xtend(auth), org, repo, ghutils.verifyData(t, testData[0].concat(testData[1])))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/' + org + '/' + repo + '/git/refs?page=1'
      , 'https://api.github.com/repos/' + org + '/' + repo + '/git/refs?page=2'
      , 'https://api.github.com/repos/' + org + '/' + repo + '/git/refs?page=3'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test get ref data for a ref', function (t) {
  t.plan(7)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , ref      = 'head/testref'
    , testData = [
          { test3: 'data3' }
      ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghrepos.getRef(xtend(auth), org, repo, ref, ghutils.verifyData(t, testData[0]))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/' + org + '/' + repo + '/git/refs/' + ref
    ]))
    .on('close'  , ghutils.verifyClose(t))
})

test('test get ref data for a ref with refs/ prefix', function (t) {
  t.plan(7)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , ref      = 'head/testref'
    , testData = [
          { test3: 'data3' }
      ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghrepos.getRef(xtend(auth), org, repo, 'refs/' + ref, ghutils.verifyData(t, testData[0]))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/' + org + '/' + repo + '/git/refs/' + ref
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test footype repo lister', function (t) {
  t.plan(10)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = [
          [ { test3: 'data3' }, { test4: 'data4' } ]
        , []
      ]
    , lister   = ghrepos.createLister('footype')
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      lister(xtend(auth), org, repo, ghutils.verifyData(t, testData[0].concat(testData[1])))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/' + org + '/' + repo + '/footype?page=1'
      , 'https://api.github.com/repos/' + org + '/' + repo + '/footype?page=2'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})
