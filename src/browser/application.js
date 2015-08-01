var ApplicationWindow, BrowserWindow, app, ipc, path;

ipc = require('ipc');
app = require('app');
path = require('path');
BrowserWindow = require('browser-window');
ApplicationWindow = require('./application-window');

class Application {
  constructor(options) {
    global.application = this;
    require('crash-reporter').start();
    app.on('window-all-closed', function() {
      if (process.platform !== 'darwin') {
        return app.quit();
      }
    });
    app.on('ready', () => this.ready());
    this.windows = [];
  }

  ready() {
    this.openWindow();
  }

  openWindow() {
    var win, windowPath;
    windowPath = path.resolve(__dirname, "..", "main-window", "index.html");
    win = new ApplicationWindow(windowPath, {
      width: 1200,
      height: 800
    }, {});
    this.addWindow(win);
  }

  removeWindow(win) {
    this.windows.splice(this.windows.indexOf(win), 1);
  }

  addWindow(win) {
    this.windows.push(win);
    win.on("closed", (function(_this) {
      return function() {
        return _this.removeWindow(win);
      };
    })(this));
  }
}

module.exports = Application;
