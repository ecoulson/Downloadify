const assert = require('assert');
const is = require('is_js');
const Struct = require('./struct');

module.exports = function () {
	describe('@Struct', () => {
		describe('#createStruct', () => {
			it ('Should create a struct', () => {
				let struct = Struct('user', { username: Date });
			});
		})
	})
}
