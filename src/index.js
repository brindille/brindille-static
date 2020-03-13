import componentManager from 'lib/core/ComponentManager'
import Component from 'brindille-component'
import { initRouter } from 'lib/router'
import * as views from './views'
import './styles/index.styl'

componentManager.registerMultiple(views)

let rootComponent = new Component(document.body, componentManager.get)
componentManager.setRootComponent(rootComponent)

const router = initRouter(rootComponent)
router.start()
