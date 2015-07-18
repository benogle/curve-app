var path = require('path')

var getEnvironment = function() {
  var environment = 'production'
  for (var i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == '--environment' && process.argv[i + 1]) {
      environment = process.argv[i + 1]
      break
    }
  }
  return environment
}

if (getEnvironment() == 'production') {
  require('electron-compile').initForProduction(path.join(__dirname, 'compile-cache'))
}
else {
  console.log('In development mode')
  require('electron-compile').init()
}

var Application = require('./src/browser/application')
application = new Application
