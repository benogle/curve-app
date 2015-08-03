let fs = require('fs')
let path = require('path')
let Curve = require('../src/editor-window/curve')
let SVGEditor = require('../src/editor-window/svg-editor')

describe('SVGEditor', function() {
  let editor, samplePath

  beforeEach(function(){
    global.curve = new Curve({})
    samplePath = path.join(__dirname, 'fixtures', 'sample.svg')
  })

  describe("when there no filePath is specified", function(){
    beforeEach(function(){
      editor = new SVGEditor(null)
    })

    it("is labeled untitled", function(){
      expect(editor.getTitle()).toBe('untitled - Curve')
      expect(document.title).toEqual(editor.getTitle())
    })

    it("renders no paths", function(){
      let canvas = editor.getCanvas()
      expect(canvas.querySelector('path')).toBeNull()
    })
  })

  describe("when a filePath is specified", function(){
    beforeEach(function(){
      editor = new SVGEditor(samplePath)
    })

    it("has the path in the title", function(){
      expect(editor.getTitle()).toBe(`${samplePath} - Curve`)
      expect(document.title).toEqual(editor.getTitle())
    })

    it("reads the file and renders the svg", function(){
      let canvas = editor.getCanvas()
      expect(canvas.querySelector('path')).not.toBeNull()
    })
  })
})
