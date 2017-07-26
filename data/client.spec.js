const assert = require('assert');

module.exports = function (lib, next) {
	describe('Client', (done) => {
		before(() => {
			lib.create();
		});

	  describe('#getClient', () => {
	    it('should return the client', () => {
	      assert.equal(lib.get().hasOwnProperty('connection'), true);
	    });
	  });

		describe('#closeClient', () => {
	    it('should close the client', () => {
	      lib.close();
	    });
	  });

		describe('#createClient', () => {
			it ('Should create an object', () => {
				assert.equal(lib.create().hasOwnProperty('connection'), true);
			});
		});
	});
}
