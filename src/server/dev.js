module.exports = async function build() {
  process.env.NODE_ENV = 'development'

  const express = require('express')
  const webpack = require('webpack')
  const pretty = require('pretty')
  const webpackConfig = require('../../webpack.config.js')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const renderer = require('./renderer')
  const { logError, webpackLogger } = require('./log')
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
    const isPartial = req.get('X-Requested-With') !== undefined
    const page = renderer.getPage(req.originalUrl)
    renderer.render(page, isPartial).then(html => {
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
    files: ['src/**/*.html', 'data/**/*.yaml']
  })
}
