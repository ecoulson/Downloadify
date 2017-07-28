const assert = require('assert');
const is = require('is_js');

const ReferenceFactory = require('./references');
const StringBuilderFactory = require('../util/StringBuilder');

const TestReference = 'redisRef:///collection:test';
const TestKey = 'collection:test';
const TestKey2 = 'collection:test2';
const MockObj = {
	a: 1,
	b: [1,2],
	c: {
		a:1,
		b:2,
		c:3,
	},
};
const MockObj2 = {
	a: 1,
	b: [1,2],
	c: {
		a:1,
		b:2,
		c:3,
	},
};
const ReferencedObject = {
	a: 1,
	b: `redisRef:///${TestKey}/list:b`,
	c: `redisRef:///${TestKey}/collection:c`,
};

let lib = {};

module.exports = function (client) {
	lib = ReferenceFactory(client.List, client.Collection, client);

	describe('@References', () => {
		describe('#getReferenceString', () => {
			it('Should get a reference string', () => {
				assert.equal(lib.getReferenceString(TestKey), TestReference);
			});
		});

		describe('#getReferenceObj', () => {
			const TestObj = {
				redisKey: TestKey,
				type: 'collection',
			};

			it ('Should get a reference object from reference string', () => {
				assert.deepEqual(TestObj, lib.getReferenceObj(TestReference));
			});
		});

		describe('#createReference', () => {
			it('Should create a reference object represented in json', (done) => {
				client.Collection.create(TestKey, MockObj, (success, obj, z) => {
					assert.equal(success, true);
					delete obj.c._key;
					delete obj.c._id;
					assert.deepEqual(MockObj2, obj);
					return done(null);
				});
			});
		});

		describe('#getReferences', () => {
			it('Should get a json object from referenced object', (done) => {
				const copy = Object.assign({}, ReferencedObject);
				lib.getReferences(copy, (json) => {
					assert.equal(is.object(json), true);
					delete json.c._key;
					delete json.c._id;
					assert.deepEqual(json, MockObj2);
					return done(null);
				});
			});
		});

		describe('#deleteReferences', () => {
			it('Should delete all references in a collection', (done) => {
				lib.deleteReferences(ReferencedObject);
				client.connection.hgetall(`redisRef:///${TestKey}/collection:c`, (err, res) => {
					assert.equal(is.null(res), true);
					return done(null);
				});
			});
		});
	});
}
