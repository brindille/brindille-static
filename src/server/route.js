const pathMatch = require('path-match')()

function trimRoutePath (path) {
  return path.replace(/^\/|\/$/g, '')
}

function getRouteFromPath (path, routes) {
  path = trimRoutePath(path)
  let params
  const route = routes.find(route => {
    const params = pathMatch(route.path)(path)
    if (params) {
      route.params = params
      return true
    }
    return false
  })

  return route || routes[0]
}

function getRouteIdFromPath (path, routes) {
  return getRouteFromPath(path, routes).id
}

module.exports = {
  getRouteFromPath,
  getRouteIdFromPath
}
