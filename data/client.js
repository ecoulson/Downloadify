const redisWrapper = require('./redis/redis');
const redis = require('redis');
let client = {};

function getClient() {
	return client;
}

function closeClient() {
	client.close(client);
}

function createClient() {
	let newConnection = redis.createClient();
	client = redisWrapper(newConnection);
	return client;
}

module.exports = {
	create: createClient,
	get: getClient,
	close: closeClient,
};
