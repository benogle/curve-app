let fs = require('fs');
let path = require('path');
let Emitter = require('event-kit').Emitter

class SVGEditorModel {
  constructor(filePath) {
    this.emitter = new Emitter
    this.modified = false
    this.documentSubscription = null

    this.filePath = filePath
    if (filePath) this.filePath = path.resolve(filePath)
  }

  /*
  Section: Events
  */

  onDidChangeFilePath(callback) {
    this.emitter.on('did-change-file-path', callback)
  }

  onDidChangeModified(callback) {
    this.emitter.on('did-change-modified', callback)
  }

  /*
  Section: Document Details
  */

  observeDocument(svgDocument) {
    if (this.documentSubscription)
      this.documentSubscription.dispose()
    this.documentSubscription = svgDocument.on('change', () => this.setModified(true))
  }

  getFilePath() {
    return this.filePath
  }

  setFilePath(filePath) {
    if(this.filePath === filePath) return;

    this.filePath = filePath
    this.emitter.emit('did-change-file-path', filePath)
  }

  isModified() {
    return this.modified
  }

  /*
  Section: File Management
  */

  readFileSync() {
    let filePath = this.getFilePath()
    if (!filePath) return null
    return fs.readFileSync(filePath, {encoding: 'utf8'})
  }

  writeFile(filePath, data, callback) {
    let options = { encoding: 'utf8' }
    this.setFilePath(filePath)
    fs.writeFile(filePath, data, options, () => {
      this.setModified(false)
      if (callback) callback()
    })
  }

  /*
  Section: Private
  */

  setModified(modified) {
    if (this.modified === modified) return;

    this.modified = modified
    this.emitter.emit('did-change-modified', modified)
  }
}

module.exports = SVGEditorModel;
