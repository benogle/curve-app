BrowserWindow = require 'browser-window'
app = require 'app'
url = require 'url'
Menu = require 'menu'

module.exports =
class ApplicationWindow
  window: null

  constructor: (indexPath, options, args) ->
    @window = new BrowserWindow(options)
    indexUrl = url.format({
      protocol: 'file',
      pathname: indexPath,
      slashes: true,
      hash: encodeURIComponent(JSON.stringify(args))
    })
    @window.loadUrl(indexUrl)

    @menu = Menu.buildFromTemplate(require('./menu-darwin')(app, @window))
    Menu.setApplicationMenu(@menu)

  on: (args...) ->
    @window.on(args...)
