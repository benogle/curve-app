let {CompositeDisposable} = require('event-kit')
let {renderTemplate} = require('./template-helper')

let Template = `
  <div class="fill-editor attribute-editor color-editor">
    <label for="fill-editor">fill color</label>
    <div class="color-wrapper">
      <input type="color" id="fill-editor" name="fill-editor" value="#eeeeee"/>
    </div>
  </div>
`

class ColorEditorView {
  constructor(propertyName) {
    this.propertyName = propertyName
    this.element = renderTemplate(Template)

    this.colorInput = this.element.querySelector('input')
    this.colorInput.addEventListener('change', this.didChangeColor.bind(this))
  }

  setObject(object) {
    if (this.subscriptions) this.subscriptions.dispose()

    this.object = object
    if (object) {
      this.subscriptions = new CompositeDisposable
      this.subscriptions.add(object.on('change', this.didChangeObject.bind(this)))
      this.updateInputColorForObject()
    }
  }

  updateInputColorForObject() {
    this.colorInput.value = this.object.get(this.propertyName)
  }

  didChangeColor() {
    if (this.object) {
      let value = {}
      value[this.propertyName] = this.colorInput.value
      this.object.set(value)
    }
  }

  didChangeObject({object, value}) {
    if (value[this.propertyName] != null) {
      this.updateInputColorForObject()
    }
  }
}

module.exports = ColorEditorView
