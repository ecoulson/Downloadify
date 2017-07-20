const fs = require('fs');
const path = require('path');
const FILE_NAME = 'RouteManager.js';
const routes = [];

function RouteManager(app, config, dir) {

	this.createRoutes = function () {
		readDir((files) => {
			files = removeFile(files);
			files = expandFileNames(files);
			files = requireFiles(files);
			mapRoutes(files);
		});
	}

	let readDir = function (next) {
		fs.readdir(dir, (err, files) => {
			if (err) {
				throw err;
			}
			next(files);
		})
	}

	let removeFile = function(files) {
		return files.filter((file) => {
			return file != FILE_NAME && file.includes('.js');
		});
	}

	let expandFileNames = function(files) {
		return files.map((file) => {
			return `./${path.join(dir, file)}`;
		});
	}

	let requireFiles = function(files) {
		return files.map((file) => {
			return require(file);
		});
	}

	let mapRoutes = function(files) {
		files.forEach((file) => {
			app.use(config.apiPath, file);
		});
	}
	this.createRoutes();
}

module.exports = RouteManager;
