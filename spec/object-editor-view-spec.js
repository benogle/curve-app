let fs = require('fs')
let path = require('path')
let Point = require('curve').Point
let Curve = require('../src/editor-window/curve')
let SVGEditor = require('../src/editor-window/svg-editor')
let ObjectEditorView = require('../src/editor-window/object-editor-view')

describe('ObjectEditorView', function() {
  let editor, samplePath, objectEditor, object

  beforeEach(function(){
    global.curve = new Curve({})
    samplePath = path.join(__dirname, 'fixtures', 'sample.svg')
    editor = new SVGEditor(samplePath)
    objectEditor = new ObjectEditorView(editor)
    jasmine.attachToDOM(objectEditor.element)
  })

  describe("when there no object selected", function(){
    it("is hidden", function(){
      expect(objectEditor.element.style.display).toBe('none')
    })
  })

  describe("when objects are selected", function(){
    beforeEach(function() {
      object = editor.svgDocument.getObjects()[0]
    })
    it("shows when there is a selected object", function(){
      editor.getDocument().getSelectionModel().setSelected(object)
      expect(objectEditor.element.style.display).not.toBe('none')
      expect(objectEditor.element.querySelector('.object-editor-title').textContent).toContain('Path')

      editor.getDocument().getSelectionModel().setSelected(null)
      expect(objectEditor.element.style.display).toBe('none')
    })
  })
})
