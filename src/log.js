var colors = require('colors');

module.exports = {
	success: function(p){
		console.log(colors.green(p))
	},
	info: function(p){
		console.log(colors.cyan(p))
	},
	warning: function(p){
		console.log(colors.yellow(p))
	},
	error: function(p){
		console.log(colors.red(p))
	}
}