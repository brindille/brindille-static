module.exports = async function build (cliOptions = {}) {
  process.env.NODE_ENV = 'production'

  const webpackConfig = require('../../webpack.build.config.js')
  const renderer = require('./renderer')
  const fs = require('fs-extra')
  const path = require('path')
  const webpack = require('webpack')
  const pretty = require('pretty')
  const PrettyError = require('pretty-error')

  // Error Logger
  const pe = new PrettyError()
  function logError (err) {
    console.log(pe.render(err))
  }

  const outDir = cliOptions.outDir ? cliOptions.outDir : path.resolve(__dirname, '../../dist')
  const routes = renderer.getRoutes()
  routes[0].isDefault = true

  await fs.remove(outDir)

  for (let route of routes) {
    await renderPage(route)
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
    const subRoutesPath = '../views/sections/' + route.id + '/routes.js'
    if (fs.existsSync(path.resolve(__dirname, subRoutesPath))) {
      delete require.cache[require.resolve(subRoutesPath)]
      const controller = require(subRoutesPath)
      return await controller(route.params)
    }
    return []
  }
  
  async function renderSubPage (route) {
    console.log('renderSubPage', route)
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
          renderSubPage(Object.assign({}, route, {path: subroute}))
        })
      } catch (err) {
        logError(err)
      }
      return
    }

    const htmlFull = pretty(await renderer.render(route))
    const htmlPartial = pretty(await renderer.render(route, true))
    const fileNameFull = pagePath + '/index.html'
    const filePathFull = path.resolve(outDir, fileNameFull)
    const fileNamePartial = pagePath + '/partial.html'
    const filePathPartial = path.resolve(outDir, fileNamePartial)

    await fs.ensureDir(path.dirname(filePathFull))

    await fs.writeFile(filePathFull, htmlFull)
    await fs.writeFile(filePathPartial, htmlPartial)
    
    if (route.isDefault) {
      await fs.writeFile(path.resolve(outDir, 'index.html'), htmlFull)
      await fs.writeFile(path.resolve(outDir, 'partial.html'), htmlPartial)
    }
  }
}
