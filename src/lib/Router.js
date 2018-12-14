import { createRouter } from 'brindille-router'
import routesDatas from 'json-loader!yaml-loader!../../data/routes.yaml'
import languagesDatas from 'json-loader!yaml-loader!../../data/languages.yaml'

export const isMultilingual = languagesDatas.length > 1
export const baseUrl = `${BASEFOLDER}`.replace(/\/$/, '')
export let router = null

function onFirstRoute (route) {
  router.off('update', onFirstRoute)
  route.path = baseUrl + route.path
  console.log('basefolder', BASEFOLDER, baseUrl)
  console.log('onFirstRoute', route.path, window.location.pathname)
  console.log(window.location.pathname.replace(baseUrl, ''))
  if (route.path !== window.location.pathname) {
    if (!isMultilingual) {
      window.history.pushState(null, null, route.path)
    }
  }
}

export function initRouter(rootComponent) {
  const routes = isMultilingual
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
      console.log('Router.getContent', route)
      console.log('-', path)
      console.log('-', baseUrl)
      console.log('-', url)
      return window
        .fetch(url, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        .then(response => response.text())
    }
  })
  router.on('update', onFirstRoute)
  return router
}

export function getCurrentRoute() {
  if (router) {
    return router.currentRoute
  } else {
    throw new Error('WAIT router is not ready yet !')
  }
}
