import ghauth from 'ghauth'
import { getCommitComments } from '../ghrepos.js'

const authData = await ghauth({
  configName: 'lister',
  clientId: 'your-client-id',
  scopes: ['user']
})

const comments = await getCommitComments(authData, 'nodejs', 'node', '75318e46b')
console.log(JSON.stringify(comments.map((i) => {
  return { user: i.user.login, body: i.body }
}), null, 2))
