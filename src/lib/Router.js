import { createRouter } from 'brindille-router'
import routesDatas from 'json-loader!yaml-loader!../../data/routes.yaml'

export let router = null

export function initRouter(rootComponent) {
  const routes = window.isMultilingual
    ? routesDatas.map(route => Object.assign(route, { path: '/:lang/' + route.path }))
    : routesDatas
  router = createRouter(rootComponent, {
    routes,
    verbose: false,
    getContent: (route, path, baseUrl) => {
      let url
      if (DEVELOPMENT) {
        url = baseUrl + path
      } else {
        url = baseUrl + path + '/partial.html'
      }
      return window
        .fetch(url, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        .then(response => response.text())
    }
  })
  return router
}

export function getCurrentRoute() {
  if (router) {
    return router.currentRoute
  } else {
    throw new Error('WAIT router is not ready yet !')
  }
}
