const lib = require('./client');
const assert = require('assert');
let globalClient = null;

describe('Client', () => {
  describe('#createClient', () => {
    lib.create((err, client) => {
      it ('should have a null value for the err', () => {
        assert.equal(err, null);
      })
      it ('should an object with an id and a client object', () => {
        assert.equal(client.id, 1);
        assert.notEqual(client.connection, null);
      });
    });
  });
  describe('#getClients', () => {
    it('should complete without an error', (done) => {
      lib.getAll(done);
    });
    it('should return an array with length of 1', () => {
      lib.getAll((err, clients) => {
        assert.equal(clients.length, 1);
      });
    });
  });
  describe('#getClient', () => {
    it('should return the client with id 1', (done) => {
      lib.get(1, (err, client) => {
        assert.equal(client.id, 1);
        assert.equal(err, null);
        globalClient = client;
        done(err, client);
      });
    });
  })
  describe('#closeClients', () => {
    it('should close the passed client', (done) => {
      lib.close(globalClient, (err) => {
        lib.getAll((err, clients) => {
          assert.equal(clients.length, 0);
          done();
        });
      });
    });
  });
});
