---
to: src/views/<%= h.inflection.pluralize(type) %>/<%= h.changeCase.param(name) %>/<%= h.changeCase.pascal(name) %>.js
---
import Component from 'brindille-component'

export default class <%= h.changeCase.pascal(name) %> extends Component {
  constructor($el) {
    super($el)
  }<% if (type === 'section') { %>

  transitionIn(callback) {
    setTimeout(() => {
      callback()
    })
  }

  transitionOut(callback) {
    setTimeout(() => {
      callback()
    })
  }<% } %>
}
