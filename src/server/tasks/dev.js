process.env.NODE_ENV = 'development'

const express = require('express')
const webpack = require('webpack')
const browserSync = require('browser-sync')
const pretty = require('pretty')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const renderer = require('../renderer')
const { logError, webpackLogger } = require('../utils/log')
const webpackConfig = require('../../../webpack.config.js')

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
  const isPartial = req.get('X-Requested-With') !== undefined
  const page = renderer.getPage(req.originalUrl)
  renderer.render(page, isPartial, req).then(html => {
    res.send(pretty(html, { ocd: true }))
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
  files: ['src/**/*.html', 'src/**/*.twig', 'data/**/*.yaml']
})
