const fs = require('fs');
const path = require('path');
const FILE_NAME = 'RouteManager.js';
const RouteDir = __dirname;
const routes = [];

function RouteManager(app, conf) {
	let expressApp = app;
	let config = conf;

	this.createRoutes = function () {
		readDir((files) => {
			files = removeFile(files);
			files = expandFileNames(files);
			files = requireFiles(files);
			mapRoutes(files);
		});
	}

	let readDir = function (next) {
		fs.readdir(RouteDir, (err, files) => {
			if (err) {
				throw err;
			}
			next(files);
		})
	}

	let removeFile = function(files) {
		return files.filter((file) => {
			return file != FILE_NAME;
		});
	}

	let expandFileNames = function(files) {
		return files.map((file) => {
			return `./${file}`;
		});
	}

	let requireFiles = function(files) {
		return files.map((file) => {
			return require(file);
		});
	}

	let mapRoutes = function(files) {
		files.forEach((file) => {
			expressApp.use(config.apiPath, file);
		});
	}
	this.createRoutes();
	return RouteManager;
}

module.exports = RouteManager;
