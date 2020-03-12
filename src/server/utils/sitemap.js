const path = require('path')
const fs = require('fs-extra')
const { SitemapStream, streamToPromise } = require('sitemap')
const formatXML = require('xml-formatter')

function writeSiteMapEntry(stream, route, languages, folderDir) {
  const langRegex = new RegExp(/:lang/, 'gi')
  const defaultLang = languages[0]
  const links = languages.map(lang => {
    return {
      url: folderDir + route.path.replace(langRegex, lang),
      lang
    }
  })
  stream.write({
    url: folderDir + route.path.replace(langRegex, defaultLang),
    links
  })
}

async function createSiteMap({
  hostname,
  routes,
  languages,
  prepareController,
  outDir,
  folderDir
} = {}) {
  console.log(folderDir)
  const sitemapStream = new SitemapStream({ hostname })

  for (let route of routes) {
    const getSubRoutes = prepareController(route).routes
    if (getSubRoutes) {
      const subroutePaths = await getSubRoutes()
      const subroutes = subroutePaths.map(route => {
        return { path: '/:lang/' + route }
      })
      subroutes.forEach(subroute => {
        writeSiteMapEntry(sitemapStream, subroute, languages, folderDir)
      })
    } else {
      writeSiteMapEntry(sitemapStream, route, languages, folderDir)
    }
  }

  sitemapStream.end()

  const sitemap = await streamToPromise(sitemapStream)
  const sitemapPath = path.resolve(outDir + folderDir, 'sitemap.xml')

  await fs.ensureDir(path.dirname(sitemapPath))
  await fs.writeFile(
    sitemapPath,
    formatXML(sitemap.toString(), { collapseContent: true })
  )
}

module.exports = { createSiteMap }
