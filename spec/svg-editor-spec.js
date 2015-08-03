let fs = require('fs')
let path = require('path')
let Point = require('curve').Point
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
      expect(editor.getTitle()).toBe('untitled')
      expect(document.title).toEqual(editor.getTitle() + ' - Curve')
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
      expect(editor.getTitle()).toBe(samplePath)
      expect(document.title).toEqual(editor.getTitle() + ' - Curve')
    })

    it("reads the file and renders the svg", function(){
      let canvas = editor.getCanvas()
      expect(canvas.querySelector('path')).not.toBeNull()
    })
  })

  describe("when the file is modified", function() {
    beforeEach(function(){
      editor = new SVGEditor(samplePath)
    })

    it("updates the isModified state when the file is edited, and resets when the file is saved", function() {
      let modifiedSpy = jasmine.createSpy()
      editor.onDidChangeModified(modifiedSpy)
      spyOn(fs, 'writeFile').and.callFake((filePath, data, options, callback) => {
        callback()
      })

      expect(editor.isModified()).toBe(false)

      object = editor.svgDocument.getObjects()[0]
      node = object.getSubpaths()[0].nodes[0]
      node.setPoint(new Point(200, 250))

      expect(editor.isModified()).toBe(true)
      expect(modifiedSpy).toHaveBeenCalled()
      modifiedSpy.calls.reset()

      node.setPoint(new Point(200, 280))
      expect(editor.isModified()).toBe(true)
      expect(modifiedSpy).not.toHaveBeenCalled()

      editor.save()
      expect(editor.isModified()).toBe(false)
      expect(modifiedSpy).toHaveBeenCalled()
    })
  })
})
