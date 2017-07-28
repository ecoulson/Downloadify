const assert = require('assert');
const is = require('is_js');

// Query Factory
function Query(query) {
	assert.equal(is.object(query), true);

	// search collections for matches and pass to callback
	function searchCollections(collections, next) {
		assert.equal(is.array(collections), true);
		assert.equal(is.function(next), true);

		let matches = findMatches(collections);
		return next(matches);
	}

	// find collections that match the query and return an array of collections
	function findMatches(collections) {
		return collections.filter((collection) => {
			return compareCollection(collection, query);
		});
	}

	// compares collections and returns the collection if it satisfies the
	// values within the query objecy. returns true if the collection satisfies
	// its constraints. False otherwise
	function compareCollection(collection, query) {
		let equal = true;
		let hasProp = false;
		for (var key in query) {
			if (collection.hasOwnProperty(key)) {
				hasProp = true;
				if (is.sameType(collection[key], query[key]) ||
						collection[key] == query[key]) {
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

	// compares two arrays and returns true if they are equal and false if they
	// are not.
	function compareArray(a1, a2) {
		assert.equal(is.array(a1), true);
		assert.equal(is.array(a2), true);

		if (a1.length != a2.length) {
			return false;
		}
		for (let i = 0; i < a1.length; i++) {
			if (is.array(a1[i]) && is.array(a2[i])) {
				let res = compareArray(a1[i], a2[i]);
				if (!res) {
					return res;
				}
			} else if (is.object(a1[i]) && is.object(a2[i])) {
				let res = compareCollection(a1[i], a2[i]);
				if (!res) {
					return res;
				}
			} else if (a1[i] != a2[i]) {
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
