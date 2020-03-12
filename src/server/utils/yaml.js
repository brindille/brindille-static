const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

module.exports = {
  loadYaml: function(url) {
    url = path.resolve(__dirname, '../../../data/' + url)
    if (fs.existsSync(url)) {
      return yaml.safeLoad(fs.readFileSync(url, 'utf8'))
    }
    return {}
  }
}
