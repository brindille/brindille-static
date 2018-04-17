const pascalCase = require('pascal-case')
const yaml = require('js-yaml')
const fs = require('fs')
const nunjucks = require('nunjucks')

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(__dirname + '/../views', {noCache: true}))

/* ---------------------------------------------------
  UTILS
--------------------------------------------------- */
function loadYaml (path) {
  path = __dirname + '/../../data/' + path
  if (fs.existsSync(path)) {
    return yaml.safeLoad(fs.readFileSync(path, 'utf8'))
  }
  return {}
}

function getPageRenderingPath (page, isPartial) {
  return isPartial === true ? 'sections/' + page + '/' + page + '.html' : 'index.html'
}

/* ---------------------------------------------------
  DATAS
--------------------------------------------------- */
function buildDatas (page) {
  const datas = {
    Main: loadYaml('main.yaml'),
    page: page,
    isProd: process.env.NODE_ENV === 'production'
  }
  datas[pascalCase(page)] = loadYaml('pages/' + page + '.yaml')
  return datas
}

/* ---------------------------------------------------
  API
--------------------------------------------------- */
function render (page, isPartial) {
  return env.render(
    getPageRenderingPath(page, isPartial),
    buildDatas(page)
  )
}

function getRoutes () {
  return loadYaml('routes.yaml')
}

module.exports = {
  render: render,
  getRoutes: getRoutes
}