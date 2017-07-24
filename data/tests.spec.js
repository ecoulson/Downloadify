const lib = require('./tests');
const ClientTests = require('./client.spec');
const RedisWrapperTests = require('./redis/redis.spec');

describe('Should Run All RedisLib Tests', () => {
	ClientTests(lib.Client);
	RedisWrapperTests(lib.Redis);
});
