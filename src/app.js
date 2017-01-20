var fs = require('fs-extra');
var path = require('path');
var log = require('./log.js');
var exists = require('fs').existsSync;
var inquirer = require('inquirer');
var request = require('request');
var download = require('download-git-repo');
var ora = require('ora');
var config = require('./configProcess.js');

var destPath = ''
var skeletonModuleName = ''
module.exports = {
    createApp: function(name, type, dest){
        destPath = path.join(dest, name);
        skeletonModuleName = name;

        fs.exists(destPath, function (exists) {
            if(exists){
                inquirer.prompt([{
                    type: 'confirm',
                    message: 'directory ' + destPath + ' existed, do you want to rewrite it.',
                    name: 'ok'
                  }]).then(function (answers) {
                    if (answers.ok) {
                        fs.emptydirSync(destPath)
                        run()
                    }
                  })
            }else{
                run()
            }
        });
    
        function run(){
            checkDistBranch(skeletonModuleName, type, downloadAndGenerate, destPath)
        }
    }
}


function customPackageJson(_path, name){
    var packageJsonPath = path.join(_path, 'package.json')
    var packageJson = fs.readFileSync(packageJsonPath,'utf-8');
    packageJson = JSON.parse(packageJson)
    var outputPackage = {
        name: name || packageJson.name
    }

    outputPackage = JSON.stringify(outputPackage, null, 2)
    fs.writeFileSync(packageJsonPath, outputPackage)
}


/**
 * Check if the template has a dist branch, if yes, use that.
 *
 * @param {String} template
 * @param {Function} cb
 */

function checkDistBranch (name, type, cb, destPath) {
    var template = config.appListInfo[type].repository,
        url = 'https://api.github.com/repos/' + template + '/branches';
        console.log('url: ', url);
    request({
        url: url,
        headers: {
            'User-Agent': 'request'
        }
    }, function (err, res, body) {
        if (err) log.error(err)
        if (res.statusCode !== 200) {
          log.error('Template does not exist: ' + template)
        } else {
          var hasDist = JSON.parse(body).some(function (branch) {
            return branch.name === 'dist'
          })
          return cb(hasDist ? template + '#dist' : template, destPath, name)
        }
    })
}

/**
 * Download a generate from a template repo.
 *
 * @param {String} template
 */

function downloadAndGenerate (template, destPath, name) {
  var spinner = ora('downloading')
  spinner.start()
  download(template, destPath, { clone: true }, function (err) {
    
    if (err) {
        log.error('Failed to download repo ' + template + ': ' + err.message.trim())
        spinner.fail()
        return ;
    }
    spinner.succeed()
    spinner.stop()
    customPackageJson(destPath, name)

    if(name){
        //rename project dirname
        fs.renameSync(destPath, path.join(path.dirname(destPath), name))
    }
    log.success('Generated success at ' + destPath + '.')
  })
}