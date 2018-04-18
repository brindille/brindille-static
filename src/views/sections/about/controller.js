function getSomeAsyncData (x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(x)
    }, 100)
  })
}

module.exports = async function aboutController () {
  return {
    toto: await getSomeAsyncData('b')
  }
}
