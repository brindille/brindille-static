const pascalCase = require('pascal-case')
const yaml = require('js-yaml')
const fs = require('fs')
const nunjucks = require('nunjucks')
const path = require('path')

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(__dirname + '/../views', {noCache: true}))
env.addFilter('page', (id, ...args) => {
  const routes = getRoutes()
  const r = routes.find(o => {
    return o.id === id
  })
  const path = r ? r.path : routes[0].path
  // console.log(path)
  // .find(r => r.id === id)
  let str = '/' + path
  if (args.length) {
    // console.log('page', args)
    str += '/' + args.join('/')
  }
  return str
})


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

function prepareController (route) {
  const controllerPath = '../views/sections/' + route.id + '/controller.js'
  if (fs.existsSync(path.resolve(__dirname, controllerPath))) {
    delete require.cache[require.resolve(controllerPath)]
    const controller = require(controllerPath)
    if (controller && controller.data) {
      route.data = controller.data
    }
    if (controller && controller.routes) {
      route.routes = controller.routes
    }
  }
  return route
}

async function loadDataFromPageController (route) {
  if (route && route.data) {
    if (typeof route.data === 'function') {
      return await route.data(route.params)
    } else {
      logError('Controller model must be a function for ' + route.id)
    }
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
  datas[pascalCase(page)]= Object.assign({}, loadPageYaml(page), await loadDataFromPageController(route))

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
  prepareController: prepareController,
  getRoutes: getRoutes
}