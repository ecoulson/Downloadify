const assert = require('assert');
const is = require('is_js');

function Query(query) {
	assert.equal(is.object(query), true);

	function searchCollections(collections, next) {
		let matches = findMatches(collections);
		return next(matches);
	}

	function findMatches(collections) {
		return collections.filter((collection) => {
			return compareCollection(collection, query);
		});
	}

	function compareCollection(collection, query) {
		let equal = true;
		let hasProp = false;
		for (var key in query) {
			if (collection.hasOwnProperty(key)) {
				hasProp = true;
				if (is.sameType(collection[key], query[key]) || collection[key] == query[key]) {
					if (is.array(collection[key])) {
						if (!compareArray(collection[key], query[key])) {
							return false;
						}
					} else if (is.object(collection[key])) {
						if (!compareCollection(collection[key], query[key])) {
							return false;
						}
					} else {
						if (collection[key] != query[key]) {
							return false;
						}
					}
				} else {
					return false;
				}
			}
		}
		return equal && hasProp;
	}

	function compareArray(a1, a2) {
		if (a1.length != a2.length) {
			return false;
		}
		for (let i = 0; i < a1.length; i++) {
			if (a1[i] != a2[i]) {
				return false;
			}
		}
		return true;
	}

	return {
		searchCollections: searchCollections
	};
}

module.exports = Query;
