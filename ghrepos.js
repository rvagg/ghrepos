const jsonist = require('jsonist')
    , qs      = require('querystring')
    , xtend   = require('xtend')


function makeOptions (auth, options) {
  return xtend({
      headers : { 'User-Agent' : 'Magic Node.js application that does magic things' }
    , auth    : auth.user + ':' + auth.token
  }, options)
}


function handler (callback) {
  return function responseHandler (err, data) {
    if (err)
      return callback(err)

    if (data.error || data.message)
      return callback(new Error('Error from GitHub: ' + (data.error || data.message)))

    callback(null, data)
  }
}


function ghget (auth, url, options, callback) {
  options = makeOptions(auth, options)

  jsonist.get(url, options, handler(callback))
}


function ghpost (auth, url, data, options, callback) {
  options = makeOptions(auth, options)

  jsonist.post(url, data, options, handler(callback))
}


function lister (auth, urlbase, options, callback) {
  var retdata = []
    , optqs  = qs.stringify(options)

  if (optqs)
    optqs = '&' + optqs

  //TODO: use 'Link' headers to improve the guesswork here
  ;(function next (page) {
    var url = urlbase + '?page=' + page + optqs

    ghget(auth, url, options, function (err, data) {
      if (err)
        return callback(err)

      if (!data.length)
        return callback(null, retdata)

      retdata.push.apply(retdata, data)

      next(page + 1)
    })
  }(1))
}


module.exports.list = function list (auth, org, options, callback) {
  if (typeof org == 'function') { // list for this user
    callback = org
    options = {}
    org = null
  } else if (typeof options == 'function') { // no options
    callback = options
    options  = {}
  }

  var urlbase = 'https://api.github.com'

  if (org == null)
    urlbase += '/user/repos'
  else
    urlbase += '/users/' + org + '/repos'

  lister(auth, urlbase, options, callback)
}


module.exports.listRefs = function listRefs (auth, org, repo, options, callback) {
  if (typeof options == 'function') { // no options
    callback = options
    options  = {}
  }

  var urlbase = 'https://api.github.com/repos/' + org + '/' + repo + '/git/refs'

  lister(auth, urlbase, options, callback)
}


module.exports.getRef = function get (auth, org, repo, ref, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  // a valid ref but we're not using this format
  ref = ref.replace(/^refs\//, '')

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/git/refs/' + ref

  ghget(auth, url, options, callback)
}
