const path = require('path')
const { loadYaml } = require('./yaml')

let config = null

function getConfig() {
  if (!config) {
    config = Object.assign(
      {
        folder: '/',
        hostname: '',
        sitemap: false
      },
      loadYaml('config.yaml'),
      {
        outDir: path.resolve(__dirname, '../../../dist')
      }
    )
  }
  return config
}

module.exports = { getConfig }
