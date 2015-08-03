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
    this.model = new SVGEditorModel(filePath)
    if (global.curve) curve.setActiveEditor(this)

    this.createCanvas()
    this.open()
  }

  onDidChangeFilePath(callback) {
    this.model.onDidChangeFilePath(callback)
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
    this.canvas = document.createElement('div');
    this.canvas.id = 'canvas'
    this.svgDocument = new SVGDocument(this.canvas);
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
