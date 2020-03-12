process.env.NODE_ENV = 'production'

const renderer = require('../renderer')
const fs = require('fs-extra')
const path = require('path')
const {
  removeStartTrailingSlash,
  removeEndTrailingSlash
} = require('../utils/paths')
const webpack = require('webpack')
const clone = require('clone')
const pretty = require('pretty')
const { logError, logBuild } = require('../utils/log')
const { getConfig } = require('../utils/config')
const { createSiteMap } = require('../utils/sitemap')

async function build() {
  const webpackConfig = require('../../../webpack.config.js')

  /*
    Config
  */
  const config = getConfig()
  const folderDir = removeEndTrailingSlash(config.folder)

  /*
    Clear dist folder
  */
  await fs.remove(config.outDir)

  /*
    Create Sitemap
  */
  if (config.sitemap) {
    await createSiteMap({
      hostname: config.hostname,
      outDir: config.outDir,
      folderDir,
      routes: renderer.routes,
      languages: renderer.languages,
      prepareController: renderer.prepareController
    })
  }

  /*
    Render each language to HTML
  */
  for (let lang of renderer.languages) {
    await renderLanguage(lang)
  }

  /*
    Build JS and CSS with webpack
  */
  await compile()

  /*
    -----------------------------------------------------------------------------------------
    -----------------------------------------------------------------------------------------
  */
  function applyLangToUrl(url, lang) {
    return url.replace(/:lang/, lang)
  }

  function applyLangToRoute(route, lang) {
    if (!renderer.isMultiLingual) {
      return route
    }
    return Object.assign(clone(route), {
      path: applyLangToUrl(route.path, lang),
      templatePath: applyLangToUrl(route.templatePath, lang),
      params: Object.assign(clone(route.params || {}), {
        lang: lang
      })
    })
  }

  async function renderLanguage(lang) {
    for (let route of renderer.routes) {
      await renderPage(
        renderer.prepareController(applyLangToRoute(route, lang)),
        lang
      )
    }
  }

  function compile() {
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

  async function getSubRoutesForPage(route) {
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

    file = removeStartTrailingSlash(file)

    if (!isPartial) {
      logBuild(
        (file !== '' ? '/' + file : '') + '/index.html',
        renderer.isMultiLingual ? route.params.lang : null
      )
    }

    try {
      html = await renderer.render(route, isPartial, {
        originalUrl: file === '' ? '/' : '/' + route.params.lang
      })
    } catch (err) {
      logError(err)
      return
    }

    const filename =
      (file !== '' ? file + '/' : '') +
      (isPartial ? 'partial.html' : 'index.html')
    const filepath = path.resolve(config.outDir + folderDir, filename)

    const prettyHtml = pretty(html, { ocd: true })

    await fs.ensureDir(path.dirname(filepath))
    await fs.writeFile(filepath, prettyHtml)
  }

  async function renderSubPage(subroute, lang) {
    if (renderer.isMultiLingual) {
      subroute = lang + '/' + subroute
    }
    const page = applyLangToRoute(renderer.getPage('/' + subroute), lang)
    renderTofile(page, subroute)
    renderTofile(page, subroute, true)
  }

  async function renderPage(route, lang) {
    const page = route.id
    const pagePath = route.path
    const isRouteWithParams = route.path.search(/:\w+/) >= 0

    if (isRouteWithParams) {
      try {
        const subRoutes = await getSubRoutesForPage(route)
        if (!subRoutes.length) {
          logError(
            new Error(
              `You need to create a src/views/sections/${page}/routes.js that exports a function that returns which subroutes need to be rendered. Ignoring this route for now.`
            )
          )
          return
        }
        subRoutes.forEach(subroute => {
          renderSubPage(subroute, lang)
        })
      } catch (err) {
        logError(err)
      }
      return
    }

    if (route.isDefault) {
      if (lang === renderer.defaultLang) {
        renderTofile(route, '')
        renderTofile(route, '', true)
      }
      if (renderer.isMultiLingual) {
        renderTofile(route, lang)
        renderTofile(route, lang, true)
      }
    }

    renderTofile(route, pagePath)
    renderTofile(route, pagePath, true)
  }
}

build()
