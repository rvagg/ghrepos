# ghrepos

<!-- [![Build Status](https://secure.travis-ci.org/rvagg/ghrepos.png)](http://travis-ci.org/rvagg/ghrepos) -->

**A node library to interact with the GitHub repos API**

[![NPM](https://nodei.co/npm/ghrepos.png?mini=true)](https://nodei.co/npm/ghrepos/)

See also:

* https://github.com/rvagg/ghissues
* https://github.com/rvagg/ghusers
* https://github.com/rvagg/ghteams
* https://github.com/rvagg/ghauth


## Example usage

```js
const ghrepos     = require('ghrepos')
    , authOptions = { user: 'rvagg', token: '24d5dee258c64aef38a66c0c5eca459c379901c2' }

// list all repos for a user
ghrepos.list(authOptions, 'rvagg', function (err, repolist) {
  // Array of repos for user 'rvagg'
  console.log(reposlist)
})

// get git ref data for a given ref string
ghrepos.getRef(authOptions, 'iojs', 'io.js', 'heads/v1.x', function (err, refData) {
  // data containing ref information including sha and github url
  console.log(refData)
})

// get git ref data for all refs in a repo
ghrepos.listRefs(authOptions, 'iojs', 'io.js', function (err, refData) {
  // data containing ref information including sha and github url
  console.log(refData)
})
```

_More methods coming .. as I need them or as you PR them in._


The auth data is compatible with [ghauth](https://github.com/rvagg/ghauth) so you can just connect them together to make a simple command-line application:

```js
const ghauth     = require('ghauth')
    , ghrepos    = require('ghrepos')
    , authOptions = {
          configName : 'team-lister'
        , scopes     : [ 'user' ]
      }

ghauth(authOptions, function (err, authData) {
  ghrepos.list(authData, 'rvagg', function (err, list) {
    console.log('Repos for rvagg:')
    console.log(util.inspect(list.map(function (i) { return {
        name: i.name
      , desc: i.description
      , fork: i.fork
    }})))
  })
})
```


## License

**ghrepos** is Copyright (c) 2015 Rod Vagg [@rvagg](https://github.com/rvagg) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.
