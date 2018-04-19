module.exports = async function build (cliOptions = {}) {
  process.env.NODE_ENV = 'development'

  const express = require('express')
  const webpack = require('webpack')
  const webpackConfig = require('../../webpack.dev.config.js')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const renderer = require('./renderer')
  const { logError, webpackLogger } = require('./log')
  const routeUtils = require('../lib/core/route-utils')
  const browserSync = require('browser-sync')

  const app = express()

  const compiler = webpack(webpackConfig)
  const devMiddleWare = webpackDevMiddleware(compiler, {
    logLevel: 'warn',
    publicPath: webpackConfig.output.publicPath
  })
  const hotMiddleWare = webpackHotMiddleware(compiler, {
    log: webpackLogger
  })

  app.use(devMiddleWare)
  app.use(hotMiddleWare)

  app.get('*', function(req, res) {
    const routes = renderer.getRoutes()
    const route = renderer.prepareController(routeUtils.getRouteByPath(req.originalUrl, routes))
    const isPartial = req.get('X-Requested-With') !== undefined
    renderer.render(route, isPartial).then(html => {
      res.send(html)
    })
  })

  const port = 3000
  const hostname = 'localhost'

  app.listen(port, hostname, err => {
    if (err) {
      logError(err)
    }
  })

  browserSync.init({
    proxy: `${hostname}:${port}`,
    port: 4000,
    ui: {
      port: 4040,
      weinre: { port: 4444 }
    },
    files: ['src/**/*.html', 'data/**/*.yaml']
  })
}
