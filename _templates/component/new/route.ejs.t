---
to: "<%= type === 'section' ? 'data/routes.yaml' : null %>"
inject: true
append: true
skip_if: "- id: '<%= h.changeCase.param(name) %>'"
---
- id: '<%= h.changeCase.param(name) %>'
  path: '<%= h.changeCase.param(name) %>'