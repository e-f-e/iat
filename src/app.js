var fs = require('fs-extra');
var path = require('path');
var log = require('./utils.js');

module.exports = {
	createApp: function(type, dest, options){
		var srcPath = mkSrc(type)

		//检查output目录是否已存在，防止覆盖
		if(!options.force){
			fs.exists(dest, function (exists) {
  				if(exists){
			    	log.warning(' -- ' + '目录' + path.resolve(dest) + '已存在，请先删除或使用 --force 强制覆盖.')
			    }else{
			    	copy()
			    }
			});
		}else{
			copy()
		}
		function copy(){
			fs.copy(srcPath, dest, function (err) {
			  if (err) return console.error(err)
			  log.success(' -- ' + type + " component layout generate success!")
			});
		}
	}
}

function mkSrc(type, options){
	options = options || {}
	var version = options.version || '1'

	if(version == 1){
		return path.join(__dirname, '../node_modules', 'vue-component-skeleton')
	}else{
		log.error('wrong params!')
	}
}