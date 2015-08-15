let DOMListener = require('dom-listener')
let ObjectEditorView = require('./object-editor-view')

class SidebarView {
  constructor(svgEditor, {element}={}) {
    this.svgEditor = svgEditor
    this.svgEditor.getDocument().on('change:tool', this.didChangeTool.bind(this))

    this.element = element || document.createElement('div')
    this.element.id = 'sidebar'

    this.objectEditor = new ObjectEditorView(svgEditor)
    this.element.appendChild(this.objectEditor.element)

    this.domListener = new DOMListener(this.element)
    this.domListener.add('.tool-button', 'click', this.didClickToolButton.bind(this))
  }

  didClickToolButton(event) {
    let toolType = event.currentTarget.getAttribute('data-tool')
    this.svgEditor.getDocument().setActiveToolType(toolType)
  }

  didChangeTool({toolType}) {
    let button = this.element.querySelector('.tool-button.active')
    if (button) button.classList.remove('active')

    button = this.element.querySelector(`.tool-button[data-tool="${toolType}"]`)
    if (button) button.classList.add('active')
  }
}

module.exports = SidebarView
