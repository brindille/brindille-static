module.exports = async function build (cliOptions = {}) {
  process.env.NODE_ENV = 'development'

  const http = require('http')
  const express = require('express')
  const webpack = require('webpack')
  const webpackConfig = require('../../webpack.dev.config.js')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const renderer = require('./renderer')
  const routeUtils = require('../lib/core/route-utils')
  const browserSync = require('browser-sync')
  const chalk = require('chalk')
  const PrettyError = require('pretty-error')

  // Error Logger
  const pe = new PrettyError()
  function logError (err) {
    console.log(pe.render(err))
  }

  const app = express()

  const compiler = webpack(webpackConfig)
  const devMiddleWare = webpackDevMiddleware(compiler, {
    logLevel: 'warn',
    publicPath: webpackConfig.output.publicPath
  })
  const hotMiddleWare = webpackHotMiddleware(compiler, {
    log: msg => {
      console.log(
        msg
          .replace(/^webpack/, '[' + chalk.yellow('Webpack') + ']    ')
          .replace(/([0-9]+)ms$/, chalk.dim('$1ms'))
          .replace(/built ([0-9a-f]+) in/, 'Built ' + chalk.dim('$1') + ' in')
      )
    }
  })

  app.use(devMiddleWare)
  app.use(hotMiddleWare)

  app.get('*', function(req, res) {
    console.log("get", req.originalUrl)
    const routes = renderer.getRoutes()
    const route = routeUtils.getRouteByPath(req.originalUrl, routes)
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
