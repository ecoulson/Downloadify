const assert = require('assert');
const is = require('is_js');


const QueryLib = require('./query');

const Obj1 = {
	a: 1,
};

const Obj2 = {
	a: 2,
	b: [1,2],
};

const Obj3 = {
	a: 3,
	b: [1,2],
	c: {
		a:1,
		b:2,
		c:3,
	},
};

const Obj4 = {
	a: 4,
	b: [1, {
		a:1,
		d:4,
	}],
	c: {
		a: 1,
		b: 2,
		c: 3,
	}
}

const Objs = [
	Obj1,
	Obj2,
	Obj3,
	Obj4,
];

module.exports = function () {
	describe('Query', () => {
		describe('#searchCollections', () => {
			it('Should find obj1', () => {
				let query = QueryLib({a:1});
				query.searchCollections(Objs, (res) => {
					assert.equal(is.array(res), true);
					assert.deepEqual(res[0], Obj1);
				});
			});

			it('Should find obj2', () => {
				let query = QueryLib({
					b: [1,2]
				});
				query.searchCollections(Objs, (res) => {
					assert.equal(is.array(res), true);
					assert.deepEqual(res[0], Obj2);
				});
			});

			it('Should find obj3', () => {
				let query = QueryLib({
					c: {
						a: 1,
						b: 2,
						c: 3,
					}
				});
				query.searchCollections(Objs, (res) => {
					assert.equal(is.array(res), true);
					assert.deepEqual(res[0], Obj3);
				});
			});

			it('Should find obj4', () => {
				let query = QueryLib({
					b: [1, {
						a:1,
						d:4,
					}],
				});
				query.searchCollections(Objs, (res) => {
					assert.equal(is.array(res), true);
					assert.deepEqual(res[0], Obj4);
				})
			})
		});
	})
}
