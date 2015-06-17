const ghutils = require('ghutils')

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

  ghutils.lister(auth, urlbase, options, callback)
}


module.exports.listRefs = function listRefs (auth, org, repo, options, callback) {
  if (typeof options == 'function') { // no options
    callback = options
    options  = {}
  }

  var urlbase = 'https://api.github.com/repos/' + org + '/' + repo + '/git/refs'

  ghutils.lister(auth, urlbase, options, callback)
}


module.exports.getRef = function get (auth, org, repo, ref, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  // a valid ref but we're not using this format
  ref = ref.replace(/^refs\//, '')

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/git/refs/' + ref

  ghutils.ghget(auth, url, options, callback)
}
