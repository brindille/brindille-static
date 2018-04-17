process.env.NODE_ENV = 'development'

const http = require('http')
const express = require('express')
const webpack = require('webpack')
const webpackConfig = require(process.env.WEBPACK_CONFIG ? process.env.WEBPACK_CONFIG : './webpack.config')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const renderer = require('./renderer')
const routeUtils = require('./route')
const browserSync = require('browser-sync')
const chalk = require('chalk')

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
  const routes = renderer.getRoutes()
  const page = routeUtils.getRouteIdFromPath(req.originalUrl, routes)
  const isPartial = req.get('X-Requested-With') !== undefined
  res.send(renderer.render(page, isPartial))
})

const port = 3000
const hostname = 'localhost'
const url = 'http://' + hostname + ':' + port

app.listen(port, hostname, err => {
  if (err) {
    console.log(err)
    return
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
