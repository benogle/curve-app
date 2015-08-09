let SVGDocument = require('curve').SVGDocument
let Point = require('curve').Point
let SVGEditorModel = require('./svg-editor-model')

class SVGEditor {
  constructor(filePath, canvasNode) {
    this.model = new SVGEditorModel(filePath)
    if (global.curve) curve.setActiveEditor(this)

    this.createCanvas(canvasNode)
    this.createDocument()
    this.observeDocument()
    this.open()

    this.model.observeDocument(this.svgDocument)

    this.bindToCommands()
  }

  /*
  Section: Events
  */

  onDidChangeFilePath(callback) {
    this.model.onDidChangeFilePath(callback)
  }

  onDidChangeModified(callback) {
    this.model.onDidChangeModified(callback)
  }

  /*
  Section: Document Details
  */

  isModified() {
    return this.model.isModified()
  }

  getFilePath() {
    return this.model.getFilePath()
  }

  getTitle() {
    return this.model.getFilePath() || 'untitled'
  }

  getCanvas() {
    return this.canvas
  }

  getDocument() {
    return this.svgDocument
  }

  /*
  Section: File Management
  */

  open() {
    try {
      let svg = this.model.readFileSync()
      if (svg)
        this.svgDocument.deserialize(svg)
    }
    catch (error) {
      console.error(error.stack);
    }
  }

  save() {
    this.saveAs(this.getFilePath())
  }

  saveAs(filePath) {
    filePath = filePath || this.getFilePath()
    try {
      let data = this.svgDocument.serialize()
      this.model.writeFile(filePath, data)
    }
    catch (error) {
      console.error(error.stack)
    }
  }

  /*
  Section: Private
  */

  bindToCommands() {
    let translate = (delta) => {
      this.svgDocument.translateSelectedObjects(delta)
    }

    let setActiveToolType = (toolType) => {
      this.svgDocument.setActiveToolType(toolType)
    }

    let cancel = () => {
      if (this.svgDocument.selectionModel.getSelected() != null)
        this.svgDocument.selectionModel.setSelected(null)
      else
        setActiveToolType('pointer')
    }

    curve.commands.add('body', {
      'core:cancel': (event) => cancel(),
      'editor:pointer-tool': (event) => setActiveToolType('pointer'),
      'editor:rectangle-tool': (event) => setActiveToolType('rectangle'),
      'editor:move-selection-up': (event) => translate(new Point(0, -1)),
      'editor:move-selection-down': (event) => translate(new Point(0, 1)),
      'editor:move-selection-left': (event) => translate(new Point(-1, 0)),
      'editor:move-selection-right': (event) => translate(new Point(1, 0)),
      'editor:move-selection-up-by-ten': (event) => translate(new Point(0, -10)),
      'editor:move-selection-down-by-ten': (event) => translate(new Point(0, 10)),
      'editor:move-selection-left-by-ten': (event) => translate(new Point(-10, 0)),
      'editor:move-selection-right-by-ten': (event) => translate(new Point(10, 0))
    })
  }

  createCanvas(canvasNode) {
    if (canvasNode) {
      this.canvas = canvasNode
    }
    else {
      this.canvas = document.createElement('div')
      this.canvas.id = 'canvas'
    }
  }

  createDocument() {
    this.svgDocument = new SVGDocument(this.canvas)
    this.svgDocument.initializeTools()
  }

  observeDocument() {
    let updateCanvasSize = () => {
      let size = this.svgDocument.getSize()
      if (size && this.canvas) {
        this.canvas.style.width = `${size.width}px`
        this.canvas.style.height = `${size.height}px`

        // HACK to get the padding reveal on the right when window < canvas size
        // There is probably a nice CSS way to do this...
        if (this.canvas.parentNode)
          this.canvas.parentNode.style.minWidth = `${size.width}px`
      }
    }

    this.svgDocument.on('change:size', updateCanvasSize)
    updateCanvasSize()
  }
}

module.exports = SVGEditor;
