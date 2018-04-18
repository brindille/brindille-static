module.exports = async function build (cliOptions = {}) {
  process.env.NODE_ENV = 'production'

  const webpackConfig = require('../../webpack.build.config.js')
  const renderer = require('./renderer')
  const fs = require('fs-extra')
  const path = require('path')
  const webpack = require('webpack')
  const pretty = require('pretty')

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
            console.error(err)
          })
          reject(new Error(`Failed to compile with errors.`))
          return
        }
        resolve(stats.toJson({ modules: false }))
      })
    })
  }
  
  async function renderPage (route) {
    const page = route.id
    const pagePath = route.path
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
