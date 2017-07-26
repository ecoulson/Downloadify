const assert = require('assert');
const CollectionKey = '0';
const SearchParam = 'type';
const query = {
	type: 'list',
	b: [1, 2],
	c: {
		a: 'dog',
	},
};
const testObj = {
	type: 'list',
	a: 1,
	b: [1, 2],
	c: {
		a:1,
	},
};


module.exports = function (lib) {
	describe('Collection', () => {
		describe('#createCollection', () => {
			it(`Should create a new collection at key ${CollectionKey}`, (done) => {
				lib.create(CollectionKey, testObj, (success, res) => {
					assert.equal(success, true);
					return done(null, res);
				});
			});
		});

		describe('#createCollection fail', () => {
			it(`Should return false at key ${CollectionKey} as it already exists`, (done) => {
				lib.create(CollectionKey, {
					type: 'list',
				}, (success, res) => {
					assert.equal(success, false);
					return done(null, res);
				});
			});
		})

		describe('#getCollection', () => {
			it(`Should get a collection at this key ${CollectionKey}`, (done) => {
				lib.get(CollectionKey, (collection) => {
					return done(null, collection);
				});
			});
		});

		describe('#setCollection', () => {
			it(`Should update the collection with a json body`, (done) => {
				lib.update(CollectionKey, {a: 24, c: { a: 'dog' }}, (collection) => {
					assert.equal(collection.a, 24);
					return done(null, collection);
				});
			});
		});

		describe('#getCollectionBy', () => {
			it(`Should get a collection by type of 'list'`, (done) => {
				lib.getAllBy(query, (res) => {
					assert.notEqual(res.length, 0);
					res.forEach((x) => {
						assert.equal(x.type, query.type);
					});
					return done(null, res);
				});
			});
		});

		describe('#deleteCollection', () => {
			it(`Delete collection with key of ${CollectionKey}`, (done) => {
				lib.delete(CollectionKey, (res) => {
					done(null, res);
				});
			});
		});
	});
}
