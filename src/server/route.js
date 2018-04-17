function trimRoutePath (path) {
  return path.replace(/^\/|\/$/g, '')
}

function isRouteValid (path, paths) {
  const route = trimRoutePath(path)
  return paths.indexOf(route) >= 0
}

function getRouteIdFromPath (path, routes) {
  const paths = Object.keys(routes).map(item => routes[item])
  let id = routes[paths[0]]
  if (isRouteValid(path, paths)) {
    id = trimRoutePath(path)
  }
  return id
}

module.exports = {
  getRouteIdFromPath
}
