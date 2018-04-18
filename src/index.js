import componentManager from 'lib/core/ComponentManager'
import Component from 'brindille-component'
import Router from 'Router'
import routes from 'json-loader!yaml-loader!../data/routes.yaml'
import 'whatwg-fetch'
import 'gsap'
import './styles/index.styl'

import View from 'views/layouts/view/View'
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

Router.init(routes)
