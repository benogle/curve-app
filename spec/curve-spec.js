let fs = require('fs')
let path = require('path')
let Curve = require('../src/editor-window/curve')

class TestEditor {
  getFilePath() { return null; }
  save() {}
  saveAs() {}
}

describe('Curve', function() {
  let editor, samplePath

  beforeEach(function(){
    global.curve = new Curve({})
    editor = new TestEditor
    curve.setActiveEditor(editor)
    spyOn(editor, 'save')
    spyOn(editor, 'saveAs')
    spyOn(curve, 'showSaveAsDialog')
  })

  describe("::saveActiveEditor", function() {
    it("does nothing when no initial filePath and user chooses no file", function() {
      curve.showSaveAsDialog.and.callFake(function(defaultPath, callback) {
        expect(defaultPath).toBe(null)
        callback()
      })

      curve.saveActiveEditor()

      expect(editor.save).not.toHaveBeenCalled()
      expect(editor.saveAs).not.toHaveBeenCalled()
    })

    it("calls saveAs with the new path when no initial filePath and user chooses a file", function() {
      curve.showSaveAsDialog.and.callFake(function(defaultPath, callback) {
        expect(defaultPath).toBe(null)
        callback('/some/file')
      })

      curve.saveActiveEditor()

      expect(editor.save).not.toHaveBeenCalled()
      expect(editor.saveAs).toHaveBeenCalledWith('/some/file')
    })

    it("calls save when the editor already has a filePath", function() {
      spyOn(editor, 'getFilePath').and.returnValue('/a-file.omg')

      curve.showSaveAsDialog.and.callFake(function(defaultPath, callback) {
        expect(defaultPath).toBe('/a-file.omg')
        callback('/some/file')
      })

      curve.saveActiveEditor()

      expect(editor.save).toHaveBeenCalled()
      expect(editor.saveAs).not.toHaveBeenCalled()
    })
  })

  describe("::saveActiveEditorAs", function() {
    it("does nothing when user chooses no file", function() {
      curve.showSaveAsDialog.and.callFake(function(defaultPath, callback) {
        expect(defaultPath).toBe(null)
        callback()
      })

      curve.saveActiveEditorAs()

      expect(editor.save).not.toHaveBeenCalled()
      expect(editor.saveAs).not.toHaveBeenCalled()
    })
  })

  it("calls with the path when the user choses a new path", function() {
    spyOn(editor, 'getFilePath').and.returnValue('/a-file.omg')

    curve.showSaveAsDialog.and.callFake(function(defaultPath, callback) {
      expect(defaultPath).toBe('/a-file.omg')
      callback('/some/file')
    })

    curve.saveActiveEditorAs()

    expect(editor.save).not.toHaveBeenCalled()
    expect(editor.saveAs).toHaveBeenCalledWith('/some/file')
  })
})
