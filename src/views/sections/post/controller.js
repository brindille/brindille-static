module.exports = function (params) {
  return new Promise(resolve => {
    resolve({
      content: params.id === 'foo' ? 'cas du foo' : 'cas du bar'
    })
  })
}
