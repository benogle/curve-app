var fs = require('fs');
var SVGDocument = require('curve').SVGDocument
var Emitter = require('event-kit').Emitter

class SVGEditorModel {
  constructor(filePath) {
    this.emitter = new Emitter
    this.filePath = filePath
    this.modified = false
    this.documentSubscription = null
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
  constructor(filePath) {
    this.model = new SVGEditorModel(filePath)
    if (global.curve) curve.setActiveEditor(this)

    this.createCanvas()
    this.createDocument()
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

  createCanvas() {
    this.canvas = document.createElement('div')
    this.canvas.id = 'canvas'
  }

  createDocument() {
    this.svgDocument = new SVGDocument(this.canvas)
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
    console.log('SAVE');
  }

  saveAs(filePath) {
    console.log('SAVEAS '+filePath);
  }
}

module.exports = SVGEditor;
