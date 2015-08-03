let remote, ipc, path

ipc = require('ipc')
path = require('path')
remote = require('remote')

module.exports =
class Curve {
  constructor(argv) {
    this.argv = argv
    ipc.on('save-active-file', this.saveActiveEditor.bind(this))
    ipc.on('save-active-file-as', this.saveActiveEditorAs.bind(this))
  }

  setActiveEditor(activeEditor) {
    this.activeEditor = activeEditor
    if (this.activeEditor.onDidChangeFilePath)
      this.activeEditor.onDidChangeFilePath(this.updateTitle.bind(this))
    if (this.activeEditor.onDidChangeModified)
      this.activeEditor.onDidChangeModified(this.updateTitle.bind(this))
    this.updateTitle()
  }

  updateTitle() {
    let filePath, isModified = false

    filePath = this.activeEditor.getFilePath()
    if (filePath)
      ipc.send('call-window-method', 'setRepresentedFilename', filePath)

    if (this.activeEditor.isModified) {
      isModified = this.activeEditor.isModified()
      ipc.send('call-window-method', 'setDocumentEdited', isModified)
    }

    if (this.activeEditor.getTitle)
      document.title = `${this.activeEditor.getTitle()}${isModified ? ' (edited)' : ''} - Curve`
    else
      document.title = 'Curve'
  }

  saveActiveEditor() {
    let filePath = this.activeEditor.getFilePath()
    if (filePath)
      this.activeEditor.save()
    else
      this.saveActiveEditorAs()
  }

  saveActiveEditorAs() {
    let filePath

    filePath = this.activeEditor.getFilePath()
    this.showSaveAsDialog(filePath, (newFileName) => {
      if (newFileName)
        this.activeEditor.saveAs(newFileName)
    })
  }

  showSaveAsDialog(defaultPath, callback) {
    let dialog, options

    dialog = remote.require('dialog')
    options = {
      title: 'Save SVG File As',
      defaultPath: defaultPath,
      filters: [
        { name: 'SVG files', extensions: ['svg'] }
      ]
    }

    dialog.showSaveDialog(null, options, callback)
  }
}
