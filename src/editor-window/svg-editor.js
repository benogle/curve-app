let SVGDocument = require('curve').SVGDocument
let Point = require('curve').Point
let SVGEditorModel = require('./svg-editor-model')

class SVGEditor {
  constructor(filePath, canvasNode, options={}) {
    this.model = new SVGEditorModel(filePath)
    if (global.curve) curve.setActiveEditor(this)

    this.createCanvas(canvasNode)
    this.createDocument()
    this.observeDocument()
    this.open(options)

    this.model.observeDocument(this.svgDocument)

    this.bindToCommands()
  }

  /*
  Section: Events
  */

  onDidChangeFilePath(callback) {
    this.model.onDidChangeFilePath(callback)
  }

  onDidChangeModified(callback) {
    this.model.onDidChangeModified(callback)
  }

  /*
  Section: Document Details
  */

  isModified() {
    return this.model.isModified()
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

  getDocument() {
    return this.svgDocument
  }

  /*
  Section: File Management
  */

  open(options) {
    try {
      let svg = this.model.readFileSync()
      if (svg)
        this.svgDocument.deserialize(svg)
      else{
        // Initializes the drawing layer when an empty file
        this.svgDocument.getObjectLayer()
        if (options.showWelcomeFile)
          this.svgDocument.deserialize(WelcomeFile)
      }
    }
    catch (error) {
      console.error(error.stack);
    }
  }

  save() {
    this.saveAs(this.getFilePath())
  }

  saveAs(filePath) {
    filePath = filePath || this.getFilePath()
    try {
      let data = this.svgDocument.serialize()
      this.model.writeFile(filePath, data)
    }
    catch (error) {
      console.error(error.stack)
    }
  }

  /*
  Section: Private
  */

  bindToCommands() {
    let translateSelected = (delta) => {
      this.svgDocument.translateSelectedObjects(delta)
    }

    let removeSelected = () => {
      this.svgDocument.removeSelectedObjects()
    }

    let setActiveToolType = (toolType) => {
      this.svgDocument.setActiveToolType(toolType)
    }

    let cancel = () => {
      if (this.svgDocument.selectionModel.getSelected() != null)
        this.svgDocument.selectionModel.setSelected(null)
      else
        setActiveToolType('pointer')
    }

    curve.commands.add('body', {
      'core:cancel': () => cancel(),
      'core:delete': () => removeSelected(),
      'editor:pen-tool': () => setActiveToolType('pen'),
      'editor:ellipse-tool': () => setActiveToolType('ellipse'),
      'editor:pointer-tool': () => setActiveToolType('pointer'),
      'editor:rectangle-tool': () => setActiveToolType('rectangle'),
      'editor:move-selection-up': () => translateSelected(new Point(0, -1)),
      'editor:move-selection-down': () => translateSelected(new Point(0, 1)),
      'editor:move-selection-left': () => translateSelected(new Point(-1, 0)),
      'editor:move-selection-right': () => translateSelected(new Point(1, 0)),
      'editor:move-selection-up-by-ten': () => translateSelected(new Point(0, -10)),
      'editor:move-selection-down-by-ten': () => translateSelected(new Point(0, 10)),
      'editor:move-selection-left-by-ten': () => translateSelected(new Point(-10, 0)),
      'editor:move-selection-right-by-ten': () => translateSelected(new Point(10, 0))
    })
  }

  createCanvas(canvasNode) {
    if (canvasNode) {
      this.canvas = canvasNode
    }
    else {
      this.canvas = document.createElement('div')
      this.canvas.id = 'canvas'
    }
  }

  createDocument() {
    this.svgDocument = new SVGDocument(this.canvas)
    this.svgDocument.initializeTools()
  }

  observeDocument() {
    let updateCanvasSize = () => {
      let size = this.svgDocument.getSize()
      if (size && this.canvas) {
        this.canvas.style.width = `${size.width}px`
        this.canvas.style.height = `${size.height}px`

        // HACK to get the padding reveal on the right when window < canvas size
        // There is probably a nice CSS way to do this...
        if (this.canvas.parentNode)
          this.canvas.parentNode.style.minWidth = `${size.width}px`
      }
    }

    this.svgDocument.on('change:size', updateCanvasSize)
    updateCanvasSize()
  }
}

var WelcomeFile = `
  <svg style="overflow: visible;" height="800" width="1024" xmlns="http://www.w3.org/2000/svg">
    <path fill="#545454" d="M691,210C691,210,760,210,760,210C760,210,760,234,760,234C760,234,714,234,714,234C714,234,714,263,714,263C714,263,747,263,747,263C747,263,747,286,747,286C747,286,714,287,714,287C714,287,714,314,714,314C714,314,759,314,759,314C759,314,759,340,759,340C759,340,689,340,689,340C689,340,691,210,691,210Z">
    </path>
    <path fill="#ff7674" d="M513,413C532,365,573,367,598,371C623,375,681,414,633,488C585,562,526,593,506,608C486,595,419,541,386,488C353,435,382,389,412,372C442,355,504,372,513,413Z">
    </path>
    <path fill="#eeeeee" d="M610,212C610,212,610,212,610,212Z">
    </path>
    <path fill="#545454" d="M338,256C338,256,361,244,361,244C361,244,351,206,313,207C275,208,263,230,262,275C261,320,275,341,314,341C353,341,363,298,363,298C363,298,336,289,336,289C336,289,334,314,312,314C290,314,290,286,291,272C292,258,291,235,314,235C337,235,338,256,338,256Z">
    </path>
    <path fill="#545454" d="M373,212C373,212,403,212,403,212C403,212,398,290,411,305C417,311,428,313,435,304C446,290,441,212,441,212C441,212,471,212,471,212C471,212,479,311,453,330C432,345,411,343,392,329C364,311,373,212,373,212Z">
    </path>
    <path fill="#545454" d="M486,338C486,338,486,211,486,211C486,211,543,205,557,220C571,235,571,247,565,262C559,277,547,281,547,281C547,281,573,338,573,338C573,338,544,338,544,338C544,338,522,289,522,289C522,289,513,290,513,290C513,290,513,338,513,338C513,338,486,338,486,338Z">
    </path>
    <path fill="#545454" d="M573,212C573,212,603,212,603,212C603,212,629,304,629,304C629,304,651,212,651,212C651,212,679,212,679,212C679,212,650,339,650,339C650,339,610,340,610,340C610,340,573,212,573,212Z">
    </path>
    <path fill="#ffffff" d="M514,233C514,233,530,230,537,237C544,244,545,254,535,260C525,266,514,262,514,262C514,262,514,233,514,233Z">
    </path>
  </svg>
`

module.exports = SVGEditor;
