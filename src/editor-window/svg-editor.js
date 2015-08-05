let fs = require('fs');
let path = require('path');
let SVGDocument = require('curve').SVGDocument
let Emitter = require('event-kit').Emitter

class SVGEditorModel {
  constructor(filePath) {
    this.emitter = new Emitter
    this.modified = false
    this.documentSubscription = null

    this.filePath = filePath
    if (filePath) this.filePath = path.resolve(filePath)
  }

  onDidChangeFilePath(callback) {
    this.emitter.on('did-change-file-path', callback)
  }

  onDidChangeModified(callback) {
    this.emitter.on('did-change-modified', callback)
  }

  observeDocument(svgDocument) {
    if (this.documentSubscription)
      this.documentSubscription.dispose()
    this.documentSubscription = svgDocument.on('change', () => this.setModified(true))
  }

  getFilePath() {
    return this.filePath
  }

  setFilePath(filePath) {
    if(this.filePath === filePath) return;

    this.filePath = filePath
    this.emitter.emit('did-change-file-path', filePath)
  }

  isModified() {
    return this.modified
  }

  setModified(modified) {
    if (this.modified === modified) return;

    this.modified = modified
    this.emitter.emit('did-change-modified', modified)
  }

  readFileSync() {
    let filePath = this.getFilePath()
    if (!filePath) return null
    return fs.readFileSync(filePath, {encoding: 'utf8'})
  }

  writeFile(filePath, data, callback) {
    let options = { encoding: 'utf8' }
    this.setFilePath(filePath)
    fs.writeFile(filePath, data, options, () => {
      this.setModified(false)
      if (callback) callback()
    })
  }
}

class SVGEditor {
  constructor(filePath, canvasNode) {
    this.model = new SVGEditorModel(filePath)
    if (global.curve) curve.setActiveEditor(this)

    this.createCanvas(canvasNode)
    this.createDocument()
    this.observeDocument()
    this.open()

    this.model.observeDocument(this.svgDocument)
  }

  onDidChangeFilePath(callback) {
    this.model.onDidChangeFilePath(callback)
  }

  onDidChangeModified(callback) {
    this.model.onDidChangeModified(callback)
  }

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
}

module.exports = SVGEditor;
