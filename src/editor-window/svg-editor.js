var fs = require('fs');
var SVGDocument = require('curve').SVGDocument
var Emitter = require('event-kit').Emitter

class SVGEditorModel {
  constructor(filePath) {
    this.filePath = filePath
    this.emitter = new Emitter
  }

  onDidChangeFilePath(callback) {
    this.emitter.on('did-change-file-path', callback)
  }

  getFilePath() {
    return this.filePath
  }

  setFilePath(filePath) {
    if(this.filePath === filePath) return;

    this.filePath = filePath
    this.emitter.emit('did-change-file-path', filePath)
  }

  readFileSync() {
    let filePath = this.getFilePath()
    if (!filePath) return null
    return fs.readFileSync(filePath, {encoding: 'utf8'})
  }
}

class SVGEditor {
  constructor(filePath) {
    if (global.curve) curve.setActiveEditor(this)

    this.model = new SVGEditorModel(filePath)
    this.model.onDidChangeFilePath(this.updateTitle.bind(this))

    this.updateTitle()
    this.createCanvas()
    this.open()
  }

  getFilePath() {
    return this.model.getFilePath()
  }

  getCanvas() {
    return this.canvas
  }

  createCanvas() {
    this.canvas = document.createElement('div');
    this.canvas.id = 'canvas'
    this.svgDocument = new SVGDocument(this.canvas);
  }

  getTitle() {
    return `${this.model.getFilePath() || 'untitled'} - Curve`
  }

  updateTitle() {
    document.title = this.getTitle()
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
