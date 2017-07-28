const RedisListWrapper = require('./list');
const RedisCollectionWrapper = require('./collection');
let connection = {};

function wrapRedis(connection) {
  return {
    List: RedisListWrapper(connection),
		Collection: RedisCollectionWrapper(connection),
  }
}

module.exports = wrapRedis;
