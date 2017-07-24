const ListTests = require('./list.spec');
const CollectionTests = require('./collection.spec');

module.exports = function (lib) {
	describe('Redis', () => {
		ListTests(lib.List);
		CollectionTests(lib.Collection);
	});
}
