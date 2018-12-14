function addStartTrailingSlash (str) {
  return '/' + removeStartTrailingSlash(str)
}

function removeStartTrailingSlash (str) {
  return str.replace(/^\//, '')
}

module.exports = {
  addStartTrailingSlash: addStartTrailingSlash,
  removeStartTrailingSlash: removeStartTrailingSlash
}