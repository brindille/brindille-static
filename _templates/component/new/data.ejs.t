---
to: "<%= type === 'section' ? 'data/' + h.changeCase.param(name) + '.yaml' : null %>"
sh: "<%= type === 'section' ? 'for d in data/*/pages/; do cp data/' + h.changeCase.param(name) + '.yaml $d; done; rm data/' + h.changeCase.param(name)+'.yaml' : ':' %>"
---
title: '<%= h.changeCase.pascal(name) %>'
