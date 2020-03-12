process.env.NODE_ENV = 'production'
process.env.PORT = process.env.PORT || 8080

const express = require('express')
const pretty = require('pretty')
const renderer = require('../renderer')
const { logError } = require('../utils/log')
const { getConfig } = require('../utils/config')

const config = getConfig()
const app = express()

app.use(express.static('dist'))

app.get('*', function(req, res) {
  const isPartial = req.get('X-Requested-With') !== undefined
  const url = req.originalUrl
    .replace(config.folder, '/')
    .replace('/partial.html', '')
  const page = renderer.getPage(url)
  renderer.render(page, isPartial, req).then(html => {
    res.send(pretty(html, { ocd: true }))
  })
})

app.listen(process.env.PORT, err => {
  if (err) {
    logError(err)
  } else {
    console.log('Server ready on localhost:' + process.env.PORT)
  }
})
