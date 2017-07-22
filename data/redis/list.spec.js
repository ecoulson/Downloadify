const assert = require('assert');
const is = require('is_js');

const ListTestKey = 'ListKey';
const ListAddItem = 'test';
const ListSetItem = 'newTest';
const FakeDataSize = 100;

module.exports = function (lib) {
	function generateFakeData(count, fakeData, next) {
		let completed = 0;
		for (let i = 0; i < count; i++) {
			lib.add(ListTestKey, fakeData, (err, res) => {
				if (err) {
					return next(err);
				}
				completed++;
				if (completed === count) {
					return next(null);
				}
			});
		}
	}

	describe('List', () => {
		describe('#add', () => {
			it('Should add an element called "test" to a list', (done) => {
				lib.add(ListTestKey, ListAddItem, (err, res) => {
					if (err) {
						return done(err);
					}
					assert.equal(res, '1');
					return done(null, res);
				});
			});
		});

		describe('#get', () => {
			it(`Should get an element "${ListAddItem}" at index 0`, (done) => {
				lib.get(ListTestKey, 0, (err, res) => {
					if (err) {
						return done(err);
					}
					assert.equal(res, ListAddItem);
					return done(null, res);
				});
			});
		});

		describe('#set', () => {
			it(`Should set element at the 0 index to "${ListSetItem}"`, (done) => {
				lib.set(ListTestKey, 0, ListSetItem, (err) => {
					if (err) {
						return done(err);
					}
					lib.get(ListTestKey, 0, (err, res) => {
						if (err) {
							return done(err);
						}
						assert.equal(res, ListSetItem);
						return done(null, res);
					})
				})
			})
		});

		describe('#remove', () => {
			it(`Should remove the last element in the list and return it`, (done) => {
				lib.remove(ListTestKey, (err, res) => {
					if (err) {
						return done(err);
					}
					assert.equal(res, ListSetItem);
					return done(null, res);
				});
			});
		});

		describe('#length', () => {
			it(`Should return ${FakeDataSize}, which is the size of the list`, (done) => {
				generateFakeData(FakeDataSize, ListAddItem, (err) => {
					if (err) {
						return done(err);
					}
					lib.size(ListTestKey, (err, res) => {
						if (err) {
							return done(err);
						}
						assert.equal(res, FakeDataSize);
						return done(null, res);
					});
				});
			});
		});

		describe('#removeValue', () => {
			const fakeValue = 'removable';
			it(`Should remove all of ${fakeValue}`, (done) => {
				generateFakeData(FakeDataSize, fakeValue, (err) => {
					if (err) {
						return done(err);
					}
					lib.removeValue(ListTestKey, fakeValue, (err, res) => {
						if (err) {
							return done(err);
						}
						assert(res, FakeDataSize);
						return done(err, res);
					});
				});
			});
		});

		describe('#all', () => {
			it(`Should get all elements from list`, (done) => {
				lib.all(ListTestKey, (err, res) => {	
					if (err) {
						return done(err);
					}
					assert.equal(is.array(res), true);
					assert.equal(res.length, FakeDataSize);
					return done(err, res)
				})
			})
		})

		describe('#clear', () => {
			it('Should clear the list of all data values', (done) => {
				lib.clear(ListTestKey, (err) => {
					if (err) {
						return done(err);
					}
					lib.size(ListTestKey, (err, res) => {
						if (err) {
							return done(err);
						}
						assert.equal(res, 0);
						return done(err, res);
					});
				});
			})
		})
	});
};
