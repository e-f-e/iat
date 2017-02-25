var config = require('../iat.config.js') || {};

var appListInfo = {};

Object.keys(config).forEach(function (prop) {
	if (prop == 'scaffolds') {
		config['appList'] = config.scaffolds.map(function (appInfo, index) {
			/**
			 * repository process
			 */
			if (typeof appInfo == 'object') {
				appListInfo[appInfo.name] = {
					repository: appInfo.repository || 'e-f-e/' + appInfo.name + '-skeleton'
				}
			} else {
				appListInfo[appInfo] = {
					repository: 'e-f-e/' + appInfo + '-skeleton'
				}
			}


			if (typeof appInfo == 'object') {
				return appInfo.name;
			} else {
				
				return appInfo;
			}
		});
	}
})

config['appListInfo'] = appListInfo;

module.exports = config;