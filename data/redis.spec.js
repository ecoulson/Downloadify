const ListTests = require('./redis/list.spec');

module.exports = function (lib) {
	describe('Redis', () => {
		ListTests(lib.List);
	});
}
