const pascalCase = require('pascal-case')
const yaml = require('js-yaml')
const fs = require('fs')
const twig = require('twig')
const path = require('path')
const getRouteByPath = require('brindille-router').getRouteByPath
const pathUtils = require('./path')

twig.cache(false)
const twigParams = {
  settings: {
    'twig options': {
      namespaces: {
        'components': path.join(__dirname, '/../views/components'),
        'layouts': path.join(__dirname, '/../views/layouts'),
        'sections': path.join(__dirname, '/../views/sections')
      }
    }
  }
}

/* ------------------------------------------------------------
  LANGS
------------------------------------------------------------ */
const languagesData = loadYaml('languages.yaml')
const defaultLang = languagesData[0]
const isMultiLingual = languagesData.length > 1

/* ------------------------------------------------------------
  ROUTES
------------------------------------------------------------ */
const routesData = loadYaml('routes.yaml')
const routes = routesData.slice(0).map((route, i) => {
  route = Object.assign(route, {
    isDefault: i === 0,
    path: pathUtils.addStartTrailingSlash(route.path),
    templatePath: pathUtils.removeStartTrailingSlash(route.path)
  })
  if (isMultiLingual) {
    route = Object.assign(route, {
      path: '/:lang' + route.path,
      templatePath: process.env.BRINDILLE_BASE_FOLDER + ':lang/' + route.templatePath
    })
  }
  return route
})

/* ------------------------------------------------------------
  TWIG FILTERS
------------------------------------------------------------ */
twig.extendFilter('page', (id, opts) => {
  const options = opts[0]
  const r = routes.find(o => o.id === id)
  let path = r ? r.templatePath : routes[0].templatePath
  const args = Object.keys(options).map(key => {
    return { key, value: options[key] }
  })
  if (args.length) {
    args.forEach(param => {
      path = path.replace(new RegExp(':' + param.key), param.value)
    })
  }
  if (isMultiLingual) {
    path = path.replace(/:lang/, defaultLang) // if no lang params use default lang (wont do anything if lang was passed in filter args)
  }
  return path
})

twig.extendFilter('asset', id => {
  return process.env.BRINDILLE_BASE_FOLDER + id
})

twig.extendFilter('ressource', id => {
  return process.env.BRINDILLE_BASE_FOLDER + id
})

/* ------------------------------------------------------------
  DATA LOADING
------------------------------------------------------------ */
function loadYaml(path) {
  path = __dirname + '/../../data/' + path
  if (fs.existsSync(path)) {
    return yaml.safeLoad(fs.readFileSync(path, 'utf8'))
  }
  return {}
}

function loadPageYaml(page, lang) {
  return loadYaml(lang + '/pages/' + page + '.yaml')
}

/* ------------------------------------------------------------
  PAGE CONTROLLER
------------------------------------------------------------ */
function prepareController(route) {
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

async function loadDataFromGlobalController(route) {
  const controllerPath = './controller.js'
  if (fs.existsSync(path.resolve(__dirname, controllerPath))) {
    delete require.cache[require.resolve(controllerPath)]
    const controller = require(controllerPath)
    if (controller && controller.data) {
      if (typeof controller.data === 'function') {
        return await controller.data(route.params)
      }
      return controller.data
    }
  }

  return {}
}

async function loadDataFromPageController(route) {
  if (route && route.data) {
    if (typeof route.data === 'function') {
      return await route.data(route.params)
    } else {
      logError('Controller model must be a function for ' + route.id)
    }
  }
  return {}
}

function getPageRenderingPath(page, isPartial) {
  return isPartial === true ? 'sections/' + page + '/' + page + '.html' : 'index.html'
}

/* ---------------------------------------------------
  DATAS
--------------------------------------------------- */
async function buildDatas(route, lang) {
  const page = route.id

  // General datas (for every pages)
  const datas = Object.assign(
    {
      getPagePath,
      Main: loadYaml(lang + '/main.yaml'),
      page: page,
      lang: lang,
      Params: route.params,
      isProd: process.env.NODE_ENV === 'production'
    },
    await loadDataFromGlobalController(route)
  )

  // Page specific datas combining page yaml if it exists and output of page controller if it exists
  datas[pascalCase(page)] = Object.assign({}, loadPageYaml(page, lang), await loadDataFromPageController(route))

  return datas
}

/* ---------------------------------------------------
  API
--------------------------------------------------- */
async function render(route, isPartial) {
  const lang =
    route.params && route.params.lang && languagesData.indexOf(route.params.lang) >= 0 ? route.params.lang : defaultLang
  const datas = await buildDatas(route, lang)
  const filepath = path.join(__dirname, '/../views/' + getPageRenderingPath(route.id, isPartial))
  const html = await twigRender(filepath, datas)
  return html
}

function twigRender (filepath, datas) {
  return new Promise((resolve, reject) => {
    twig.renderFile(filepath, Object.assign(datas, twigParams), (err, html) => {
      if (err) {
        reject(err)
      } else {
        resolve(html)
      }
    })
  })
}

function getPage(path) {
  const route = getRouteByPath(path, routes) || routes[0]
  return prepareController(route)
}

const getPagePath = function(name, lang = null, params = null) {
  const l = routes.length
  var path = ''
  for (let i = 0; i < l; i++) {
    if (routes[i].id === name) path = routes[i].path
  }
  if (params) {
    for (param in params) {
      path = path.replace(':' + param, params[param])
    }
  }
  if (lang) path = lang + '/' + path
  if (path.indexOf('/') !== 0) path = '/' + path
  return path
}

module.exports = {
  render: render,
  getPage: getPage,
  prepareController: prepareController,
  routes: routes,
  languages: languagesData,
  defaultLang: defaultLang,
  isMultiLingual: isMultiLingual
}
