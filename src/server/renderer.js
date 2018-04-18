const pascalCase = require('pascal-case')
const yaml = require('js-yaml')
const fs = require('fs')
const nunjucks = require('nunjucks')
const path = require('path')

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

function loadPageYaml (page) {
  return loadYaml('pages/' + page + '.yaml')
}

async function loadDataFromPageController (page) {
  const controllerPath = '../views/sections/' + page + '/' + page + '-controller.js'
  if (fs.existsSync(path.resolve(__dirname, controllerPath))) {
    delete require.cache[require.resolve(controllerPath)]
    const controller = require(controllerPath)
    return await controller()
  }
  return {}
}

function getPageRenderingPath (page, isPartial) {
  return isPartial === true ? 'sections/' + page + '/' + page + '.html' : 'index.html'
}

/* ---------------------------------------------------
  DATAS
--------------------------------------------------- */
async function buildDatas (route) {
  const page = route.id

  // General datas (for every pages)
  const datas = {
    Main: loadYaml('main.yaml'),
    page: page,
    Params: route.params,
    isProd: process.env.NODE_ENV === 'production'
  }

  // Page specific datas combining page yaml if it exists and output of page controller if it exists
  datas[pascalCase(page)]= Object.assign({}, loadPageYaml(page), await loadDataFromPageController(page))

  return datas
}

/* ---------------------------------------------------
  API
--------------------------------------------------- */
function render (route, isPartial) {
  return buildDatas(route).then(datas => {
    return env.render(getPageRenderingPath(route.id, isPartial), datas)
  })
}

function getRoutes () {
  return loadYaml('routes.yaml')
}

module.exports = {
  render: render,
  getRoutes: getRoutes
}