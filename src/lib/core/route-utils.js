const pathToRegexp = require('path-to-regexp')

function match (path, rule) {
  let keys = []
  const re = pathToRegexp(rule, keys, {})
  const m = re.exec(path)
  if (!m) return false

  const params = {}
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    const param = m[i + 1]
    if (!param) continue
    params[key.name] = param
    if (key.repeat) params[key.name] = params[key.name].split(key.delimiter)
  }
  return params
}

function getRouteByPath (path = '', routes) {
  path = path.replace('/', '')
  const route = routes.find(r => {
    const params = match(path, r.path)
    if (params) {
      r.params = params
      return true
    }
    return false
  })
  return route || routes[0]
}

module.exports = {
  match: match,
  getRouteByPath: getRouteByPath
}
