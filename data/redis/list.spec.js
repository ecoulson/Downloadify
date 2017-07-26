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
			lib.add(ListTestKey, fakeData, () => {
				completed++;
				if (completed === count) {
					return next();
				}
			});
		}
	}

	describe('List', () => {
		describe('#add', () => {
			it('Should add an element called "test" to a list', (done) => {
				lib.add(ListTestKey, ListAddItem, (res) => {
					assert.equal(res, 'test');
					return done(null, res);
				});
			});
		});

		describe('#get', () => {
			it(`Should get an element "${ListAddItem}" at index 0`, (done) => {
				lib.get(ListTestKey, 0, (res) => {
					assert.equal(res, ListAddItem);
					return done(null, res);
				});
			});
		});

		describe('#set', () => {
			it(`Should set element at the 0 index to "${ListSetItem}"`, (done) => {
				lib.set(ListTestKey, 0, ListSetItem, (res) => {
					assert.equal(res, ListSetItem);
					return done(null, res);
				})
			})
		});

		describe('#remove', () => {
			it(`Should remove the last element in the list and return it`, (done) => {
				lib.remove(ListTestKey, (res) => {
					assert.equal(res, ListSetItem);
					return done(null, res);
				});
			});
		});

		describe('#length', () => {
			it(`Should return ${FakeDataSize}, which is the size of the list`, (done) => {
				generateFakeData(FakeDataSize, ListAddItem, () => {
					lib.size(ListTestKey, (res) => {
						assert.equal(res, FakeDataSize);
						return done(null, res);
					});
				});
			});
		});

		describe('#removeValue', () => {
			const fakeValue = 'removable';
			it(`Should remove all of ${fakeValue}`, (done) => {
				generateFakeData(FakeDataSize, fakeValue, () => {
					lib.removeValue(ListTestKey, fakeValue, (res) => {
						assert(res, FakeDataSize);
						return done(null, res);
					});
				});
			});
		});

		describe('#all', () => {
			it(`Should get all elements from list`, (done) => {
				lib.all(ListTestKey, (res) => {
					assert.equal(is.array(res), true);
					assert.equal(res.length, FakeDataSize);
					return done(null, res)
				});
			});
		});

		describe('#contains', () => {
			it('Should return that the list contains the value dog', (done) => {
				lib.add(ListTestKey, 'dog', (res) => {
					lib.contains(ListTestKey, 'dog', (res) => {
						assert.equal(res, true);
						return done(null, res);
					});
				});
			});
		});

		describe('#clear', () => {
			it('Should clear the list of all data values', (done) => {
				lib.clear(ListTestKey, (x) => {
					lib.size(ListTestKey, (res) => {
						assert.equal(res, 0);
						return done(null, res);
					});
				});
			});
		});
	});
};
