var fs = require('fs-extra');
var path = require('path');
var log = require('./utils.js');

var destPath = ''
var skeletonModuleName = ''
module.exports = {
    createApp: function(type, dest, options){
        var srcPath = mkSrc(type)
        destPath = path.join(dest, options.name)

        //检查output目录是否已存在，防止覆盖
        if(!options.force){
            fs.exists(destPath, function (exists) {
                if(exists){
                    log.warning(' -- ' + '目录' + destPath + '已存在，请先删除或使用 --force 强制覆盖.')
                }else{
                    copy()
                }
            });
        }else{
            copy()
        }
        function copy(){
            fs.copy(srcPath, destPath, function (err) {
              if (err) return console.error(err)
                customPackageJson(destPath, options)

                if(options.name){
                    //生成目录重命名
                    fs.renameSync(destPath, path.join(path.dirname(destPath), options.name))
                }
                log.success(' -- ' + type + " component skeleton generate at " + path.resolve(destPath))
            });
        }
    }
}

function mkSrc(type, options){
    options = options || {}
    var version = options.version || '1'

    if(version == 1){
        skeletonModuleName = 'vue-component-skeleton'
        return path.join(__dirname, '../node_modules', skeletonModuleName)
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
        scripts: packageJson.scripts
    }

    outputPackage = JSON.stringify(outputPackage, null, 2)
    fs.writeFileSync(packageJsonPath, outputPackage)

    //.gitignore
    var gitignorePath = path.join(_path, '.gitignore')
    var gitignoreStr = 'node_modules/'
    fs.ensureFile(gitignorePath, function (err) {
            fs.writeFileSync(gitignorePath, gitignoreStr)
    })
}