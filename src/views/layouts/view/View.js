import Component from 'brindille-component'
import componentManager from 'lib/core/ComponentManager'
import Router from 'Router'

export default class View extends Component {
  constructor ($el) {
    super($el)

    this.onRoute = this.onRoute.bind(this)
    this.showFirstPage = this.showFirstPage.bind(this)

    Router.on('update', this.onRoute)
    Router.once('first', this.showFirstPage)
  }

  dispose () {
    Router.off('update', this.onRoute)
    Router.off('first', this.showFirstPage)
    super.dispose()
  }

  showFirstPage (done) {
    this.currentPage = this._componentInstances[0]
    this.currentPage.transitionIn(done)
  }

  transitionOutAndAfterIn (done) {
    this._componentInstances[this._componentInstances.length - 1].transitionOut(() => {
      this.removeAllChilds()
      this.addNewPage()
      this.currentPage.transitionIn(done)
    })
  }

  removeAllChilds (except) {
    this._componentInstances.forEach((value, i) => {
      if (value !== except) {
        value.dispose()
        this._componentInstances.splice(i, 1)
      }
    })

    if (!except) this._componentInstances = []
  }

  addNewPage () {
    if (!this.currentPage.$el) return
    this._componentInstances.push(this.currentPage)
    this.$el.appendChild(this.currentPage.$el)
  }

  createSection (text) {
    let $node = document.createElement('div')
    $node.innerHTML = text
    $node = $node.firstChild

    let componentName = $node.getAttribute('data-component')
    let Ctor = componentManager.get(componentName)

    $node.removeAttribute('data-component')

    let section = new Ctor($node)
    section.init(componentManager.rootComponent.definitions)
    section.componentName = componentName
    section.parent = this

    return section
  }

  manageSpecialPages () {}

  onRoute (id, content, done) {
    window.scrollTo(0, 0)
    this.currentPage = this.createSection(content)
    this.content = content

    if (this._componentInstances.length) {
      this.transitionOutAndAfterIn(done)
      this.manageSpecialPages(id)
    } else {
      this.removeAllChilds()
      this.addNewPage()
      done()
    }
  }
}