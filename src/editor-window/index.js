var Curve = require('./curve');
var SVGEditor = require('./svg-editor');

window.onload = function() {
  var hash, args, editor
  hash = window.location.hash.slice(1)
  args = Object.freeze(JSON.parse(decodeURIComponent(hash)))
  global.curve = new Curve(args)
  global.EDITOR = editor = new SVGEditor(args.fileName)
  document.body.appendChild(editor.getCanvas())
}
