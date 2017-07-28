const redisWrapper = require('./redis/redis');
const redis = require('redis');
let client = {};

function getClient() {
	return client;
}

function closeClient() {
	if (client.hasOwnProperty('connection')) {
		client.connection.end(true);
	}
}

function createClient() {
	let newConnection = redis.createClient();
	client = redisWrapper(newConnection);
	client.connection = newConnection;
	return client;
}

module.exports = {
	create: createClient,
	get: getClient,
	close: closeClient,
};
