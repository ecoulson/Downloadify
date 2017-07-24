const assert = require('assert');
const CollectionKey = '0';
const SearchParam = 'type';
const query = {
	type: 'list',
	id: 0,
};


module.exports = function (lib) {
	describe('Collection', () => {
		describe('#createCollection', () => {
			it(`Should create a new collection at key ${CollectionKey}`, (done) => {
				lib.create(CollectionKey, {
					type: 'list',
					key: 'list:1',
				}, (res) => {
					assert.equal(res, 'OK');
					return done(null, res);
				});
			});
		});

		describe('#getCollection', () => {
			it(`Should get a collection at this key ${CollectionKey}`, (done) => {
				lib.get(CollectionKey, (collection) => {
					return done(null, collection);
				});
			});
		});

		describe('#getCollectionBy', () => {
			it(`Should get a collection by type of 'list' and id of '1'`, (done) => {
				lib.getAllBy(query, (res) => {
					assert.notEqual(res.length, 0);
					res.forEach((x) => {
						assert.equal(x.id, query.id);
						assert.equal(x.type, query.type);
					});
					return done(null, res);
				})
			})
		})
	})
}
