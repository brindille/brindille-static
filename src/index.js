import componentManager from 'lib/core/ComponentManager'
import Component from 'brindille-component'
import { initRouter } from 'lib/Router'
import { View } from 'brindille-router'
import 'whatwg-fetch'
import 'gsap'
import './styles/index.styl'
console.log('styes ?')

import Home from 'views/sections/home/Home'
import About from 'views/sections/about/About'
import Post from 'views/sections/post/Post'
import Posts from 'views/sections/posts/Posts'

componentManager.registerMultiple({
  /* Layouts */
  View,
  /* Sections */
  Home,
  About,
  Posts,
  Post
})

let rootComponent = new Component(document.body, componentManager.get)
componentManager.setRootComponent(rootComponent)

const router = initRouter(rootComponent)
router.start()
