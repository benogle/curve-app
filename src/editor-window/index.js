var SVGEditor = require('./svg-editor');

window.onload = function() {
  var hash = window.location.hash.slice(1)
  var args = Object.freeze(JSON.parse(decodeURIComponent(hash)))
  new SVGEditor(args.fileName)
}
