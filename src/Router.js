import page from 'page'
import Emitter from 'emitter-component'

class Router extends Emitter {
  constructor () {
    super()

    this.isFirstRoute = true
    this.isReady = true

    this.loadRoute = this.loadRoute.bind(this)
    this.notFound = this.notFound.bind(this)
  }

  init (routes, options = {}) {
    this.baseUrl = options.baseUrl || ''

    this.routes = routes
    this.defaultRoute = this.routes[0]

    this.routes.forEach(route => {
      console.log('[Router] registering route:', '/' + route.path)
      page('/' + route.path, this.loadRoute)
    })
    page('*', this.notFound)

    page.base(this.baseUrl)

    page.start()
  }

  /* ========================================================
    Utils
  ======================================================== */
  getRouteByPath (path = '') {
    path = path.replace('/', '')
    return this.routes.find(route => route.path === path) || this.routes[0]
  }

  /* ========================================================
    Not found / Default route
  ======================================================== */
  notFound (context) {
    console.log('[Router] notFound', context.path)
    page.redirect('/' + this.defaultRoute.path)
  }

  /* ========================================================
    API
  ======================================================== */
  redirect (url) {
    page(url)
  }

  fullRedirection (url) {
    let path = '/' + url
    window.location.href = 'http://' + window.location.hostname + this.baseUrl + path
  }

  /* ========================================================
    Main Controller
  ======================================================== */
  loadRoute (context) {
    let currentRoute = this.getRouteByPath(context.path)

    // Stop handling route when trying to reach the current route path
    if (currentRoute === this.currentRoute) return

    // When we start handling the route we tell the app we are busy
    this.isReady = false

    // Shift current and previous routes
    this.previousRoute = this.currentRoute
    this.currentRoute = currentRoute

    console.log('[Router] route:', this.currentPageId)

    // If current route is first route, the dom is already present, we just need the view to launch transition in of current view
    if (this.isFirstRoute) {
      this.emit('first', () => {
        this.isFirstRoute = false
        this.routeCompleted()
      })
      return
    }

    // In every other cases we need to load the partial of the new route before launching transitions
    let path = context.path + '/partial.html'
    let options = {}

    // In dev mode the partial is loaded from express routes rather than from html file
    if (process.env.NODE_ENV !== 'production') {
      path = context.path
      options = {headers: {'X-Requested-With': 'XMLHttpRequest'}}
    }

    // When request is done we pass the content to the view and wait for transitions to complete before continuing
    window.fetch(this.baseUrl + path, options).then(response => {
      return response.text()
    }).then(body => {
      this.emit('update', this.currentPageId, body, () => {
        this.routeCompleted()
      })
    })
  }

  routeCompleted () {
    // Everyting is over, app is ready to do stuff again
    this.isReady = true
  }

  get currentPath () { return this.currentRoute.path }
  get currentPageId () { return this.currentRoute.id }
  get previousPath () { return this.previousRoute.path }
  get previousPageId () { return this.previousRoute.id }
}

export default new Router()
