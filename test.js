const http           = require('http')
    , test           = require('tape')
    , xtend          = require('xtend')
    , EE             = require('events').EventEmitter
    , bl             = require('bl')
    , jsonist        = require('jsonist')
    , _jsonistget    = jsonist.get
    , _jsonistpost   = jsonist.post


var ghrepos = require('./')

function makeServer (data) {
  var ee     = new EE()
    , i      = 0
    , server = http.createServer(function (req, res) {
        ee.emit('request', req)

        var _data = Array.isArray(data) ? data[i++] : data
        res.end(JSON.stringify(_data))

        if (!Array.isArray(data) || i == data.length)
          server.close()
      })
      .listen(0, function (err) {
        if (err)
          return ee.emit('error', err)

        jsonist.get = function (url, opts, callback) {
          ee.emit('get', url, opts)
          return _jsonistget('http://localhost:' + server.address().port, opts, callback)
        }

        ee.emit('ready')
      })
      .on('close', ee.emit.bind(ee, 'close'))

  return ee
}


function toAuth (auth) {
  return 'Basic ' + (new Buffer(auth.user + ':' + auth.token).toString('base64'))
}


function verifyRequest (t, auth) {
  return function (req) {
    t.ok(true, 'got request')
    t.equal(req.headers['authorization'], toAuth(auth), 'got auth header')
  }
}


function verifyUrl (t, urls) {
  var i = 0
  return function (_url) {
    if (i == urls.length)
      return t.fail('too many urls/requests')
    t.equal(_url, urls[i++], 'correct url')
  }
}


function verifyClose (t) {
  return function () {
    t.ok(true, 'got close')
  }
}


function verifyData (t, data) {
  return function (err, _data) {
    t.notOk(err, 'no error')
    t.ok((data === '' && _data === '') || _data, 'got data')
    t.deepEqual(_data, data, 'got expected data')
  }
}


test('test list repos for org/user', function (t) {
  t.plan(10)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , testData = [ [ { test1: 'data1' }, { test2: 'data2' } ], [] ]
    , server

  server = makeServer(testData)
    .on('ready', function () {
      ghrepos.list(xtend(auth), org, verifyData(t, testData[0]))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/users/testorg/repos?page=1'
      , 'https://api.github.com/users/testorg/repos?page=2'
    ]))
    .on('close'  , verifyClose(t))
})


test('test list repos for authed user', function (t) {
  t.plan(10)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , testData = [
          [ { test3: 'data3' }, { test4: 'data4' } ]
        , []
      ]
    , server

  server = makeServer(testData)
    .on('ready', function () {
      ghrepos.list(xtend(auth), verifyData(t, testData[0]))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/user/repos?page=1'
      , 'https://api.github.com/user/repos?page=2'
    ]))
    .on('close'  , verifyClose(t))
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

  server = makeServer(testData)
    .on('ready', function () {
      ghrepos.list(xtend(auth), verifyData(t, testData[0].concat(testData[1])))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/user/repos?page=1'
      , 'https://api.github.com/user/repos?page=2'
      , 'https://api.github.com/user/repos?page=3'
    ]))
    .on('close'  , verifyClose(t))
})


test('test list repos for authed user with no repos', function (t) {
  t.plan(7)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , testData = [ [] ]
    , server

  server = makeServer(testData)
    .on('ready', function () {
      ghrepos.list(xtend(auth), verifyData(t, []))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/user/repos?page=1'
    ]))
    .on('close'  , verifyClose(t))
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

  server = makeServer(testData)
    .on('ready', function () {
      ghrepos.listRefs(xtend(auth), org, repo, verifyData(t, testData[0].concat(testData[1])))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/repos/' + org + '/' + repo + '/git/refs?page=1'
      , 'https://api.github.com/repos/' + org + '/' + repo + '/git/refs?page=2'
      , 'https://api.github.com/repos/' + org + '/' + repo + '/git/refs?page=3'
    ]))
    .on('close'  , verifyClose(t))
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

  server = makeServer(testData)
    .on('ready', function () {
      ghrepos.getRef(xtend(auth), org, repo, ref, verifyData(t, testData[0]))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/repos/' + org + '/' + repo + '/git/refs/' + ref
    ]))
    .on('close'  , verifyClose(t))
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

  server = makeServer(testData)
    .on('ready', function () {
      ghrepos.getRef(xtend(auth), org, repo, 'refs/' + ref, verifyData(t, testData[0]))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/repos/' + org + '/' + repo + '/git/refs/' + ref
    ]))
    .on('close'  , verifyClose(t))
})

