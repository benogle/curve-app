let remote, ipc, path, KeymapManager

ipc = require('ipc')
path = require('path')
remote = require('remote')
KeymapManager = require('atom-keymap')

module.exports =
class Curve {
  constructor(argv) {
    this.argv = argv
    ipc.on('save-active-file', this.saveActiveEditor.bind(this))
    ipc.on('save-active-file-as', this.saveActiveEditorAs.bind(this))

    this.keymaps = new KeymapManager
    this.keymaps.defaultTarget = document.body
    this.keymaps.loadKeymap(path.join(__dirname, '..', '..', 'keymaps'))

    window.addEventListener('core:move-up', (event) => console.log('up', event))
    window.addEventListener('core:move-down', (event) => console.log('down', event))
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

  confirmClose() {
    if (!this.activeEditor.isModified()) return true

    let options, chosen, filePath, title

    title = this.activeEditor.getTitle()

    options = {
      message: `'${title}' has changes, do you want to save them?`,
      detailedMessage: "Your changes will be lost if you close this item without saving.",
      buttons: ["Save", "Cancel", "Don't Save"]
    }
    chosen = this.showConfirmDialog(options)

    switch (chosen) {
      case 0:
        this.saveActiveEditor()
        return true
      case 1:
        return false
      case 2:
        return true
    }
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

  showConfirmDialog(options) {
    let dialog, chosen

    dialog = remote.require('dialog')
    chosen = dialog.showMessageBox(remote.getCurrentWindow(),{
      type: 'info',
      message: options.message,
      detail: options.detailedMessage,
      buttons: options.buttons
    })

    return chosen
  }
}
