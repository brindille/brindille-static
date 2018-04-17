import Component from 'brindille-component'
import componentManager from 'lib/core/ComponentManager'
import Router from 'Router'

export default class View extends Component {
  constructor ($el) {
    super($el)

    this.onRoute = this.onRoute.bind(this)
    this.showFirstPage = this.showFirstPage.bind(this)

    Router.on('change:ready', this.onRoute)
    Router.once('change:first', this.showFirstPage)
  }

  dispose () {
    Router.off('change:ready', this.onRoute)
    Router.off('change:first', this.showFirstPage)
    super.dispose()
  }

  showFirstPage () {
    this.currentPage = this._componentInstances[0]
    this.currentPage.transitionIn(this.firstPageShown)
  }

  transitionInAndAfterOut () {
    this.addNewPage()

    this.currentPage.transitionIn(() => {
      this.removeAllChilds(this.currentPage)
      this.firstPageShown()
    })
  }

  transitionOutAndAfterIn () {
    this._componentInstances[this._componentInstances.length - 1].transitionOut(() => {
      this.removeAllChilds()
      this.addNewPage()
      this.currentPage.transitionIn(this.firstPageShown)
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

  firstPageShown () {
    Router.emit('change:done')
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

  onRoute (path, id, content) {
    window.scrollTo(0, 0)
    this.currentPath = path
    this.currentPage = this.createSection(content)
    this.content = content

    if (this._componentInstances.length) {
      this.transitionOutAndAfterIn()
      this.manageSpecialPages(id)
    } else {
      this.removeAllChilds()
      this.addNewPage()
      this.firstPageShown()
    }
  }
}