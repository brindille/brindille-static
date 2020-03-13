---
inject: true
to: src/views/index.js
after: \/\* <%= h.inflection.pluralize(h.inflection.capitalize(type)) %> \*\/
skip_if: export { default as <%= h.changeCase.pascal(name) %> } from '\.\/<%= h.inflection.pluralize(type) %>\/<%= h.changeCase.param(name) %>\/<%= h.changeCase.pascal(name) %>'
---
export { default as <%= h.changeCase.pascal(name) %> } from './<%= h.inflection.pluralize(type) %>/<%= h.changeCase.param(name) %>/<%= h.changeCase.pascal(name) %>'