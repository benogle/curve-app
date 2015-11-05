var BrowserWindow, Menu, app, url;

BrowserWindow = require('browser-window');
app = require('app');
url = require('url');
Menu = require('menu');

class ApplicationWindow {
  // `indexPath` - {String} path to the HTML page
  // `browserWindowOptions` - {Object} options for the BrowserWindow
  // `rendererArgs` - {Object} arguments that are passed to the renderer process
  constructor(indexPath, browserWindowOptions, rendererArgs) {
    var indexUrl;
    this.window = new BrowserWindow(browserWindowOptions);

    // Arguments are passed to the renderer via the URL hash as JSON.
    // e.g. file:///some/path/to/index.html#{filePath: '/path/to/file/to/open.svg'}
    indexUrl = url.format({
      protocol: 'file',
      pathname: indexPath,
      slashes: true,
      hash: encodeURIComponent(JSON.stringify(rendererArgs))
    });
    this.window.loadUrl(indexUrl);
    this.menu = Menu.buildFromTemplate(require('./menu-'+process.platform)(app, this.window));
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
