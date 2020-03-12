process.env.NODE_ENV = 'production'

const { logError } = require('../utils/log')
const { getConfig } = require('../utils/config')
const webpack = require('webpack')
const fs = require('fs-extra')
const webpackConfig = require('../../../webpack.config.js')

const config = getConfig()
fs.removeSync(config.outDir)

webpack(webpackConfig, (err, stats) => {
  if (err) {
    logError(err)
  } else if (stats.hasErrors()) {
    stats.toJson().errors.forEach(err => {
      logError(err)
    })
    logError(new Error(`Failed to compile with errors.`))
    return
  }
})
