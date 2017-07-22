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

	let searchCollections = function () {

	}

	deconstructQuery(keys, params);

	return {
		getParams: getParams,
		getKeys: getKeys,
		searchCollections: searchCollections
	};
}

module.exports = Query;
