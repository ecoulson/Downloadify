const RedisListWrapper = require('./redis/list');
const RedisCollectionWrapper = require('./redis/collection');
let connection = {};

function closeConnection(client) {
	if (client.hasOwnProperty('connection')) {
		client.connection.quit();
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
