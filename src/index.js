import brindille from './lib/brindille'
import { initRouter } from './lib/router'
import * as views from './views'
import './styles/index.styl'

const app = brindille(document.body, views)

const router = initRouter(app)
router.start()
