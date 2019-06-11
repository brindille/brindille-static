const build = require('./build')
const dev = require('./dev')
const argv = require('minimist')(process.argv.slice(2))

process.env.BRINDILLE_BASE_FOLDER = argv.b ? '/' + argv.b + '/' : '/'

if (argv.dev) {
  dev(argv).catch(console.log)
} else if (argv.prod) {
  build(argv).catch(console.log)
}
