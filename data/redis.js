const redis = require('redis');
const connection = createConnection();

function createConnection(client) {
  let connection = redis.createClient();
  connection.on('error', (err) => {
    console.log(`Error ${err}`);
  });
  return connection;
}

function addListItem(key, item, next) {

}

function getListItem(key, index, next) {

}

function removeListItem(key, item, next) {

}

function setListItem(key, item, index, next) {

}

function wrapRedis(id) {
  return {
    id: id,
    connection: connection,
    list: {
      add: addListItem,
      get: getListItem,
      remove: removeListItem,
      set: setListItem,
    }
  }
}

module.exports = wrapRedis;
