const RedisListWrapper = require('./list');
const RedisCollectionWrapper = require('./collection');
let connection = {};

function closeConnection(client) {
	if (client.hasOwnProperty('connection')) {
		client.connection.end();
	}
}

function wrapRedis(connection) {
  return {
    connection: connection,
		close: closeConnection,
    List: RedisListWrapper(connection),
		Collection: RedisCollectionWrapper(connection),
  }
}

module.exports = wrapRedis;
