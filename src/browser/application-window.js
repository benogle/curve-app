var BrowserWindow, Menu, app, url;

BrowserWindow = require('browser-window');
app = require('app');
url = require('url');
Menu = require('menu');

class ApplicationWindow {
  constructor(indexPath, options, args) {
    var indexUrl;
    this.window = new BrowserWindow(options);
    indexUrl = url.format({
      protocol: 'file',
      pathname: indexPath,
      slashes: true,
      hash: encodeURIComponent(JSON.stringify(args))
    });
    this.window.loadUrl(indexUrl);
    this.menu = Menu.buildFromTemplate(require('./menu-darwin')(app, this.window));
    Menu.setApplicationMenu(this.menu);
  }

  on() {
    var args = 1 <= arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
    return this.window.on.apply(this.window, args);
  };

  close() {
    this.window.close()
  };
}

module.exports = ApplicationWindow;
