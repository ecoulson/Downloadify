const lib = require('./tests');
const ClientTests = require('./client.spec');
const RedisWrapperTests = require('./redis/redis.spec');
const StringBuilderTests = require('./util/StringBuilder.spec');
const QueryTests = require('./util/query.spec');
const StructTests = require('./structs/struct.spec');

describe('Should Run All Redis Rhino Tests', () => {
	ClientTests(lib);
	QueryTests();
	StringBuilderTests();
	RedisWrapperTests(lib.create());
	StructTests();
});
