const assert = require('assert');
const is = require('is_js');

const StringBuilderFactory = require('./StringBuilder');
const StringBuilder = StringBuilderFactory();

module.exports = function () {
	describe('StringBuilder', () => {
		describe('#append', () => {
			it('Should append value to string', () => {
				StringBuilder.append('abcdefgh');
				assert.equal(StringBuilder.toString(), 'abcdefgh');
			});
		});

		describe('#remove', () => {
			it ('Should remove value "cde" from the StringBuilder', () => {
				StringBuilder.remove('cde');
				assert.equal(StringBuilder.toString(), 'abfgh');
			});
		});

		describe('#toString', () => {
			it ('Should return a string from the StringBuilder', () => {
				StringBuilder.append('ijklmnop')
				assert.equal(StringBuilder.toString(), 'abfghijklmnop');
			});
		});
	});
}
