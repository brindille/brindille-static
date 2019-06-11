import { createRouter, matchRoute } from 'brindille-router'
import routesDatas from 'json-loader!yaml-loader!data/routes.yaml'
import languagesDatas from 'json-loader!yaml-loader!data/languages.yaml'

export const isMultilingual = languagesDatas.length > 1
export const baseUrl = `${BASEFOLDER}`.replace(/\/$/, '')
export let router = null

export let previousRoute
export let currentRoute

function onFirstRoute (route) {
  router.off('update', onFirstRoute)
  route.path = baseUrl + route.path
  
  const match = matchRoute(window.location.pathname, route.path)
  if (!match) {
    window.history.pushState(null, null, isMultilingual ? route.path.replace(/:lang/, languagesDatas[0]) : route.path)
  }
}

function onRoute(route) {
  previousRoute = currentRoute
  currentRoute = route
}

export function initRouter(rootComponent) {
  let baseUrl = document.querySelector('script#main').getAttribute('src').replace(/\/?build.js/g, '').replace(/^\//, '')
  const routes = isMultilingual
    ? routesDatas.map(route => Object.assign(route, { path: '/:lang/' + route.path }))
    : routesDatas
  router = createRouter(rootComponent, {
    routes,
    baseUrl,
    verbose: false,
    beforeCompile: $node => {
      const ignoredComponents = [].slice.call(
        $node.querySelectorAll(
          window.isMobile ? '.brindille--desktop [data-component]' : '.brindille--mobile [data-component]'
        )
      )
      ignoredComponents.forEach(el => el.setAttribute('data-component', ''))
      return Promise.resolve($node)
    },
    getContent: ({ base, path }) => {
      let url
      if (DEVELOPMENT) {
        url = base + path
      } else {
        url = base + path + '/partial.html'
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
  router.on('update', onFirstRoute)
  router.on('update', onRoute)
  return router
}

export function getCurrentRoute() {
  if (router) {
    return router.currentRoute
  } else {
    throw new Error('WAIT router is not ready yet !')
  }
}

export function redirect(route) {
  if (router) {
    router.goTo(route)
  } else {
    throw new Error('WAIT router is not ready yet !')
  }
}