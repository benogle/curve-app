let {CompositeDisposable} = require('event-kit')
let ColorEditorView = require('./color-editor-view')
let {renderTemplate} = require('./template-helper')

let Template = `
  <div class="object-editor">
    <div class="object-editor-title"></div>
    <div class="attribute-editors"></div>
  </div>
`

class ObjectEditorView {
  constructor(svgEditor) {
    this.svgEditor = svgEditor
    this.selectionModel = this.svgEditor.getDocument().getSelectionModel()

    this.selectionModel.on('change:selected', this.didChangeSelection.bind(this))

    this.element = renderTemplate(Template)

    this.fillEditor = new ColorEditorView('fill')
    this.element.appendChild(this.fillEditor.element)
    this.hide()
  }

  didChangeSelection({object}) {
    if (object) {
      this.setTitle(object.getType())
      this.show()
    }
    else {
      this.hide()
    }
    this.fillEditor.setObject(object)
  }

  show() {
    this.element.style.display = null
  }

  hide() {
    this.element.style.display = 'none'
  }

  setTitle(title) {
    this.element.querySelector('.object-editor-title').textContent = title
  }
}

module.exports = ObjectEditorView
