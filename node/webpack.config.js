var webpack = require("webpack"), path = require("path").resolve(__dirname, "../"), unhelper = process.argv.indexOf("unhelper") > -1;;

module.exports = {
	entry: [
		"./source/rexjs-template.js"
	],
	output: {
		path,
		filename: unhelper ? "rexjs-template-unhelper.min.js" : "rexjs-template.min.js"
	},
	module: {
		loaders: [
			{
				test: /\.js?$/,
				loader: "rexjs-loader",
				options: {
					root: path,
					unhelper
				}
			}
		]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin()
	]
};