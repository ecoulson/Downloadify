const ListTests = require('./list.spec');
const CollectionTests = require('./collection.spec');
const ReferenceTests = require('./references.spec');

module.exports = function (lib) {
	after(() => {
		describe('flush the database', () => {
			it ('Should flush the database of all values', (done) => {
				lib.connection.flushall(done);
			});
		});
	});

	describe('{Redis}', () => {
		ListTests(lib.List);
		CollectionTests(lib.Collection);
		ReferenceTests(lib);
	});
}
