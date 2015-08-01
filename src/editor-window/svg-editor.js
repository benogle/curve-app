var fs = require('fs');
var SVGDocument = require('curve').SVGDocument

class SVGEditor {
  constructor(svgPath) {
    this.svgPath = svgPath;
    window.EDITOR = this

    this.updateTitle()
    this.createDocument()
    this.deserialize()
  }

  deserialize() {
    if (!this.svgPath) return; 
    try {
      var svg = fs.readFileSync(this.svgPath, {encoding: 'utf8'});
      this.svgDocument.deserialize(svg);
    }
    catch (error) {
      console.error(error.message);
    }
  }

  createDocument() {
    this.canvas = document.createElement('div');
    this.canvas.id = 'canvas'
    document.body.appendChild(this.canvas);
    this.svgDocument = new SVGDocument(this.canvas);
  }

  updateTitle() {
    document.title = `${this.svgPath || 'untitled'} - Curve`
  }
}

module.exports = SVGEditor;

// var canvas, doc, Examples;
//
//
// window.DOC = doc = new SVGDocument("canvas");
//
// Examples = {
//   rects: '<svg height="1024" width="1024" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="30" width="200" height="400" fill="red" /></svg>',
// };
//
// doc.deserialize(Examples.rects);
