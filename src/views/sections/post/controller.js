module.exports = {
  data: (params) => {
    return new Promise(resolve => {
      resolve({
        content: params.id === 'foo' ? 'cas du foo' : 'cas du bar'
      })
    })
  },
  routes: () => {
    return new Promise(resolve => {
      resolve([
        'post/foo',
        'post/bar'
      ])
    })
  }
}
