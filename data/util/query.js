const Client = require('../client');

const assert = require('assert');
const is = require('is_js');

function Query(queryObj) {
	assert.equal(is.object(queryObj), true);

	let query = queryObj;
	let keys = [];
	let params = [];

	let deconstructQuery = function(keys, params) {
		for (var k in query) {
			keys.push(k);
			params.push(query[k]);
		}
		assert.equal(keys.length, params.length);
	}

	let getParams = function () {
		return params;
	}

	let getKeys = function () {
		return keys;
	}

	let searchCollections = function (next) {
		let client = Client.create();
		client.Collection.getAll((err, res) => {
			if (err) {
				return next(err);
			}
			client.close(client);
			let matches = findMatches(res);
			return next(err, matches);
		});
	}

	let findMatches = function (collections) {
		return collections.filter((collection) => {
			return compareCollection(collection);
		});
	}

	let compareCollection = function (collection) {
		let equals = true;
		keys.forEach((key, i) => {
			if (collection.hasOwnProperty(key) && collection[key] != params[i]) {
				equals = false;
			}
		});
		return equals;
	}


	deconstructQuery(keys, params);

	return {
		getParams: getParams,
		getKeys: getKeys,
		searchCollections: searchCollections
	};
}

module.exports = Query;
