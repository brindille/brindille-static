module.exports = {
  data: () => {
    return new Promise(resolve => {
      resolve({
        GlobalData: 'hello'
      })
    })
  }
}
