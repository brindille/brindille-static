function addStartTrailingSlash(str) {
  return '/' + removeStartTrailingSlash(str)
}

function removeStartTrailingSlash(str) {
  return str.replace(/^\//, '')
}

function removeEndTrailingSlash(str) {
  return str.replace(/\/$/, '')
}

module.exports = {
  addStartTrailingSlash,
  removeStartTrailingSlash,
  removeEndTrailingSlash
}
