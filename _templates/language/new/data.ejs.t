---
to: data/languages.yaml
inject: true
append: true
skip_if: "- '<%= lang %>'"
sh: find ./data -maxdepth 1 ! -path ./data -type d -exec cp {} ./data/<%= lang %> -r \; -quit
---
- '<%= lang %>'