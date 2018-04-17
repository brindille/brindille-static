import page from 'page'
import Emitter from 'emitter-component'

class Router extends Emitter {
  constructor () {
    super()

    this.currentPath = undefined
    this.previousPath = ''
    this.previousPageId = ''
    this.currentPageId = ''
    this.isFirstRoute = true
    this.isReady = true
    this.routes = []
    this.defaultRoute = ''
    this.baseUrl = ''

    this.loadRoute = this.loadRoute.bind(this)
    this.routeLoaded = this.routeLoaded.bind(this)
    this.routeCompleted = this.routeCompleted.bind(this)
    this.notFoundController = this.notFoundController.bind(this)
  }

  registerRoutes (routes, defaultRoute) {
    this.routes = Object.keys(routes)
    this.paths = this.routes.map((key) => routes[key])
    this.defaultRoute = defaultRoute || this.routes[0]

    this.paths.forEach((value) => {
      console.log('[Router] registering route:', '/' + value)
      page('/' + value, this.loadRoute)
    })
    page('*', this.notFoundController)

    if (window.baseUrl) {
      page.base(window.baseUrl)
    }
    page.start()
  }

  /* ========================================================
    Utils
  ======================================================== */
  getPageId (path) {
    let id
    if (path === undefined) {
      id = ''
    } else {
      const pathSplit = path.split('/')
      id = pathSplit[0]
    }
    return this.routes[this.paths.indexOf(id)]
  }

  getPath (context) {
    let id = context.path.replace('/', '')
    let path = id === '' ? this.defaultRoute : id
    return path
  }

  /* ========================================================
    Not found / Default route
  ======================================================== */
  notFoundController (context) {
    if (this.routes.indexOf(this.getPageId(this.getPath(context))) < 0) {
      let path = '/' + this.defaultRoute
      page(path)
    }
  }

  /* ========================================================
    Route Methods
  ======================================================== */
  redirect (url) {
    let path = url
    page(path)
  }

  fullRedirection (url) {
    let path = '/' + url
    window.location.href = 'http://' + window.location.hostname + window.baseUrl + path
  }

  loadRoute (context) {
    this.isReady = false

    
    let currentPath = this.getPath(context)
    if (currentPath === this.currentPath) return

    this.previousPath = this.currentPath
    this.currentPath = currentPath

    this.previousPageId = this.getPageId(this.previousPath)
    this.currentPageId = this.getPageId(this.currentPath)

    this.emit('change:start', this.currentPath, this.isFirstRoute)
    this.off('change:done')

    if (this.isFirstRoute) {
      this.once('change:done', () => {
        this.routeLoaded(context)
      })
      this.emit('change:first', this.currentPath, this.currentPageId)
      return
    }

    let path = context.path + '/partial.html'
    let options = {}
    if (process.env.NODE_ENV !== 'production') {
      path = context.path
      options = {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    }

    window.fetch(this.baseUrl + path, options).then(response => {
      return response.text()
    }).then(body => {
      this.content = body
      this.routeLoaded(context)
    })
  }

  routeLoaded (context) {
    if (this.isFirstRoute) {
      this.isFirstRoute = false
      return this.routeCompleted()
    }
    this.once('change:done', this.routeCompleted)
    this.emit('change:ready', this.currentPath, this.currentPageId, this.content, this.isFirstRoute)
    this.emit('update', this.currentPageId, this.isFirstRoute)
  }

  routeCompleted () {
    this.isReady = true
  }
}

export default new Router()
