module.exports = async function build (cliOptions = {}) {
  process.env.NODE_ENV = 'production'

  const webpackConfig = require('../../webpack.config.js')
  const renderer = require('./renderer')
  const fs = require('fs-extra')
  const path = require('path')
  const webpack = require('webpack')
  const pretty = require('pretty')
  const { logError } = require('./log')
  const getRouteByPath = require('brindille-router').getRouteByPath

  let outDir = cliOptions.outDir ? cliOptions.outDir : path.resolve(__dirname, '../../dist')
  let folderDir = process.env.BRINDILLE_BASE_FOLDER.replace(/\/$/, '')

  const routes = renderer.getRoutes()
  routes[0].isDefault = true

  await fs.remove(outDir)

  for (let route of routes) {
    await renderPage(renderer.prepareController(route))
  }

  const stats = await compile()

  function compile () {
    return new Promise((resolve, reject) => {
      webpack(webpackConfig, (err, stats) => {
        if (err) {
          return reject(err)
        }
        if (stats.hasErrors()) {
          stats.toJson().errors.forEach(err => {
            logError(err)
          })
          reject(new Error(`Failed to compile with errors.`))
          return
        }
        resolve(stats.toJson({ modules: false }))
      })
    })
  }

  async function getSubRoutesForPage (route) {
    if (route && route.routes) {
      if (typeof route.routes === 'function') {
        return await route.routes()
      } else {
        logError('Controller routes must be a function for ' + route.id)
      }
    }
    return []
  }

  async function renderTofile(route, file, isPartial = false) {
    let html

    try {
      html = await renderer.render(route, isPartial)
    } catch (err) {
      logError(err)
      return
    }

    const filename = (file !== '' ? file + '/' : '') + (isPartial ? 'partial.html' : 'index.html')
    const filepath = path.resolve(outDir + folderDir, filename)
    // console.log('outDir', outDir)
    // console.log('folderDir', folderDir)
    // console.log('filepath', filepath)

    await fs.ensureDir(path.dirname(filepath))
    await fs.writeFile(filepath, pretty(html))
  }
  
  async function renderSubPage (subroute) {
    const routes = renderer.getRoutes(true)
    const route = getRouteByPath('/' + subroute, routes) || routes[0]
    const page = renderer.prepareController(route)
    renderTofile(page, subroute)
    renderTofile(page, subroute, true)
  }

  async function renderPage (route) {
    const page = route.id
    const pagePath = route.path
    const isRouteWithParams = route.path.search(/:\w+/) >= 0

    if (isRouteWithParams) {
      try {
        const subRoutes = await getSubRoutesForPage(route)
        if (!subRoutes.length) {
          logError(new Error(`You need to create a src/views/sections/${page}/routes.js that exports a function that returns which subroutes need to be rendered. Ignoring this route for now.`))
          return
        }
        subRoutes.forEach(subroute => {
          renderSubPage(subroute)
        })
      } catch (err) {
        logError(err)
      }
      return
    }

    renderTofile(route, pagePath)
    renderTofile(route, pagePath, true)
    
    if (route.isDefault) {
      renderTofile(route, '')
      renderTofile(route, '', true)
    }
  }
}
