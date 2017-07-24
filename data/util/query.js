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

	let searchCollections = function (collections, next) {
		let matches = findMatches(collections);
		return next(matches);
	}

	let findMatches = function (collections) {
		return collections.filter((collection) => {
			return compareCollection(collection);
		});
	}

	let compareCollection = function (collection) {
		return checkPropertyCount(collection) && checkValues(collection);
	}

	function checkPropertyCount(collection) {
		let properties = 0;
		keys.forEach((key) => {
			if (collection.hasOwnProperty(key)) {
				properties++;
			}
		});
		return properties > 0;
	}

	function checkValues(collection) {
		let equals = true;
		keys.forEach((key, i) => {
			if (collection.hasOwnProperty(key) && collection[key] != params[i]) {
				equals = false;
			}
		});
		return equals
	}


	deconstructQuery(keys, params);

	return {
		getParams: getParams,
		getKeys: getKeys,
		searchCollections: searchCollections
	};
}

module.exports = Query;
