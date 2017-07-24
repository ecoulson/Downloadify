const assert = require('assert');
const CollectionKey = '0';
const SearchParam = 'type';
const query = {
	type: 'list',
};
const testObj = {
	type: 'list',
	key: CollectionKey,
	a:1,
	b: {
		a: 1
	},
	c: [1,2,3],
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
					key: CollectionKey,
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

		describe('#setCollection', () => {
			it(`Should update the collection with a json body`, (done) => {
				lib.update(CollectionKey, {a: 1}, (collection) => {
					assert.equal(collection.a, 1);
					return done(null, collection);
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
