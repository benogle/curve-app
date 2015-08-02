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
}

class SVGEditor {
  constructor(filePath) {
    this.model = new SVGEditorModel(filePath)
    this.model.onDidChangeFilePath(this.updateTitle.bind(this))

    this.updateTitle()
    this.createCanvas()
    this.deserialize()
  }

  getCanvas() {
    return this.canvas
  }

  createCanvas() {
    this.canvas = document.createElement('div');
    this.canvas.id = 'canvas'
    this.svgDocument = new SVGDocument(this.canvas);
  }

  deserialize() {
    let filePath = this.model.getFilePath()
    if (!filePath) return;

    try {
      var svg = fs.readFileSync(filePath, {encoding: 'utf8'});
      this.svgDocument.deserialize(svg);
    }
    catch (error) {
      console.error(error.stack);
    }
  }

  getTitle() {
    return `${this.model.getFilePath() || 'untitled'} - Curve`
  }

  updateTitle() {
    document.title = this.getTitle()
  }
}

module.exports = SVGEditor;
