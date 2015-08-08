var Curve = require('./curve');
var SVGEditor = require('./svg-editor');

window.onload = function() {
  var hash, args, editor
  hash = window.location.hash.slice(1)
  args = Object.freeze(JSON.parse(decodeURIComponent(hash)))

  document.body.classList.add(`platform-${process.platform}`)

  global.curve = new Curve(args)
  editor = new SVGEditor(args.fileName, document.querySelector('#canvas'))
  global.EDITOR = editor // debugging

  nicelyCenter(editor)

  window.onbeforeunload = function() {
    return curve.confirmClose()
  }

  document.addEventListener('keydown', function(event) {
    curve.keymaps.handleKeyboardEvent(event)
  })
}

function nicelyCenter(editor) {
  let top, left, canvas = editor.getCanvas()

  top = canvas.offsetTop - 20
  left = (canvas.offsetWidth / 2 + canvas.offsetLeft) - window.innerWidth / 2

  document.body.scrollTop = top
  document.body.scrollLeft = left
}
