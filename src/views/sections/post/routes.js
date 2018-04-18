module.exports = function () {
  return new Promise(resolve => {
    resolve([
      'post/foo',
      'post/bar'
    ])
  })
}
