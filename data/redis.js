const RedisListWrapper = require('./redis/list.js');
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
  }
}

module.exports = wrapRedis;
