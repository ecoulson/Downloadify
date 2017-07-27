const lib = require('./tests');
const ClientTests = require('./client.spec');
const RedisWrapperTests = require('./redis/redis.spec');
const QueryTests = require('./util/query.spec');

describe('Should Run All RedisLib Tests', () => {
	ClientTests(lib);
	QueryTests();
	RedisWrapperTests(lib.create());
});
