var request = require('request')
var semver = require('semver')
var packageConfig = require('../package.json')
var log = require('./log.js')

module.exports = function (done) {
  // Parse version number from strings such as 'v4.2.0' or `>=4.0.0'
  function parseVersionNumber (versionString) {
    return parseFloat(versionString.replace(/[^\d\.]/g, ''))
  }

  // Ensure minimum supported node version is used
  var minNodeVersion = parseVersionNumber(packageConfig.engines.node)
  var currentNodeVersion = parseVersionNumber(process.version)
  if (minNodeVersion > currentNodeVersion) {
    return log.error()(
      '  You must upgrade node to >=' + minNodeVersion + '.x to use iat'
    )
  }

  request('https://registry.npmjs.org/iat', 
    function (err, res, body) {
    if (!err && res.statusCode === 200) {
      var latestVersion = JSON.parse(body)['dist-tags'].latest
      var localVersion = packageConfig.version
      if (semver.lt(localVersion, latestVersion)) {
        console.log()
        log.warning(('  A newer version of iat is available.'))
        console.log()
        log.info('  latest:    ' + (latestVersion))
        log.error('  installed: ' + (localVersion))
        console.log()
      }
    }else{
      log.error(res)
    }
    if(done){
      done()
    }
  })
}
