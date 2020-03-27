---
to: src/views/<%= h.inflection.pluralize(type) %>/<%= h.changeCase.param(name) %>/<%= h.changeCase.param(name) %>.twig
---
<div class="<%= h.changeCase.pascal(name) %>" data-component="<%= h.changeCase.pascal(name) %>"></div>
