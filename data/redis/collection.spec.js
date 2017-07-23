const assert = require('assert');
const CollectionKey = '0';
const SearchParam = 'type';
const QueryLib = require('../util/query');
const query = QueryLib({
	type: 'list',
	id: 1,
});


module.exports = function (lib) {
	describe('Collection', () => {
		describe('#createCollection', () => {
			it(`Should create a new collection at key ${CollectionKey}`, (done) => {
				lib.create(CollectionKey, {
					type: 'list',
					key: 'list:1',
				}, done);
			})
		})
		describe('#getCollection', () => {
			it(`Should get a collection at this key ${CollectionKey}`, (done) => {
				lib.get(CollectionKey, done);
			})
		});
		describe('#getCollectionBy', () => {
			it(`Should get a collection by type of 'list'`, (done) => {
				lib.getAllBy(CollectionKey, query, (err, res) => {
					if (err) {
						return done(err);
					}
					return done(err, res);
				})
			})
		})
	})
}
