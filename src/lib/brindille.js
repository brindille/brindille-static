import Component from 'brindille-component'

/**
 * Creates a brindille application
 * @param {Element} $el DOM Element our brindille application will be wrapped around
 * @param {Object} components An object of component definitions with following format { ComponentClassName: componentClassDefinition }
 */
export default function brindille($el, components) {
  return new Component($el, name => components[name])
}
