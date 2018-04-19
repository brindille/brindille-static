const PrettyError = require('pretty-error')
const chalk = require('chalk')

const pe = new PrettyError()

module.exports = {
  logError: err => {
    console.log(pe.render(err))
  },
  webpackLogger: msg => {
    console.log(
      msg
        .replace(/^webpack/, '[' + chalk.yellow('Webpack') + ']    ')
        .replace(/([0-9]+)ms$/, chalk.dim('$1ms'))
        .replace(/built ([0-9a-f]+) in/, 'Built ' + chalk.dim('$1') + ' in')
    )
  }
} 