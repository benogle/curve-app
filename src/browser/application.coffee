ApplicationWindow = require './application-window'
ipc = require('ipc')
BrowserWindow = require('browser-window')
app = require('app')

module.exports =
class Application
  staticPath: "#{__dirname}/../../static"
  windows: null

  constructor: (options) ->
    global.application = this

    # Report crashes to our server.
    require('crash-reporter').start()

    # Quit when all windows are closed.
    app.on 'window-all-closed', -> app.quit() if process.platform != 'darwin'
    app.on 'ready', @ready

    @windows = []

  ready: =>
    @openWindow()

  openWindow: ->
    win = new ApplicationWindow("file://#{@staticPath}/index.html", {width: 1200, height: 800})
    @addWindow(win)

  # Public: Removes the window from the global window list.
  removeWindow: (window) ->
    @windows.splice @windows.indexOf(window), 1

  # Public: Adds the window to the global window list.
  addWindow: (window) ->
    @windows.push window
    window.on "closed", => @removeWindow(window)
