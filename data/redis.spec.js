const ListTests = require('./redis/list.spec');
const CollectionTests = require('./redis/collection.spec');

module.exports = function (lib) {
	describe('Redis', () => {
		ListTests(lib.List);
		CollectionTests(lib.Collection);
	});
}
