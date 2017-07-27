const ListTests = require('./list.spec');
const CollectionTests = require('./collection.spec');
const ReferenceTests = require('./references.spec');

module.exports = function (lib) {
	console.log(lib);
	describe('Redis', () => {
		ListTests(lib.List);
		CollectionTests(lib.Collection);
		ReferenceTests(lib);
	});
}
