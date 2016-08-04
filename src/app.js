var fs = require('fs-extra');
var path = require('path');
var log = require('./utils.js');
var exists = require('fs').existsSync
var inquirer = require('inquirer')
var request = require('request')
var download = require('download-git-repo')
var ora = require('ora')

var destPath = ''
var skeletonModuleName = ''
module.exports = {
    createApp: function(type, dest, options){
        mkTemplate(type, options)
        destPath = path.join(dest, options.name)

        //检查output目录是否已存在，防止覆盖
        if(!options.force){
            fs.exists(destPath, function (exists) {
                if(exists){
                    inquirer.prompt([{
                        type: 'confirm',
                        message: '目录' + destPath + '已存在. 是否继续?(原目录会被覆盖)',
                        name: 'ok'
                      }]).then(function (answers) {
                        if (answers.ok) {
                          run()
                        }
                      })
                    //log.warning(' -- ' + '目录' + destPath + '已存在，请先删除或使用 --force 强制覆盖.')
                }else{
                    run()
                }
            });
        }else{
            run()
        }
        function run(){
            checkDistBranch(skeletonModuleName, downloadAndGenerate, destPath, options)
            // fs.copy(srcPath, destPath, function (err) {
            //   if (err) return console.error(err)
            //     customPackageJson(destPath, options)

            //     if(options.name){
            //         //生成目录重命名
            //         fs.renameSync(destPath, path.join(path.dirname(destPath), options.name))
            //     }
            //     log.success(' -- ' + type + " component skeleton generate at " + path.resolve(destPath))
            // });
        }
    }
}

function mkTemplate(type, options){
    options = options || {}
    var version = options.version || '1'

    if(version == 1){
        skeletonModuleName = 'vue-component-skeleton'
    }else{
        log.error('wrong params!')
    }
}

function customPackageJson(_path, option){
    var packageJsonPath = path.join(_path, 'package.json')
    var packageJson = fs.readFileSync(packageJsonPath,'utf-8');
    packageJson = JSON.parse(packageJson)
    var outputPackage = {
        name: option.name || packageJson.name,
        version: '0.0.1',
        description: packageJson.description,
        dependencies: packageJson.dependencies,
        devDependencies: packageJson.devDependencies,
        scripts: packageJson.scripts,
        main: packageJson.main,
        keywords: packageJson.keywords,
        license: packageJson.license
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

function checkDistBranch (template, cb, destPath, options) {
    template = 'iwaimai-bi-fe/' + template
  request({
    url: 'https://api.github.com/repos/' + template + '/branches',
    headers: {
      'User-Agent': 'iwaimai'
    }
  }, function (err, res, body) {
    if (err) log.error(err)
    if (res.statusCode !== 200) {
      log.error('Template does not exist: ' + template)
    } else {
      var hasDist = JSON.parse(body).some(function (branch) {
        return branch.name === 'dist'
      })
      return cb(hasDist ? template + '#dist' : template, destPath, options)
    }
  })
}

/**
 * Download a generate from a template repo.
 *
 * @param {String} template
 */

function downloadAndGenerate (template, destPath, options) {
  var spinner = ora('downloading template')
  spinner.start()
  download(template, destPath, { clone: true }, function (err) {
    
    if (err) {
        log.error('Failed to download repo ' + template + ': ' + err.message.trim())
        spinner.fail()
        return ;
    }
    spinner.succeed()
    spinner.stop()
    customPackageJson(destPath, options)

    if(options.name){
        //生成目录重命名
        fs.renameSync(destPath, path.join(path.dirname(destPath), options.name))
    }
      log.success('Generated success at ' + destPath + '.')
    // generate(name, tmp, to, function (err) {
    //   if (err) log.error(err)
    // })
  })
}