---
to: src/views/<%= h.inflection.pluralize(type) %>/<%= h.changeCase.param(name) %>/<%= h.changeCase.param(name) %>.styl
---
.<%= h.changeCase.pascal(name) %>
  position relative
