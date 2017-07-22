
const redisWrapper = require('./redis');
const clients = [];
let key = 0;

function getClients(next) {
  return next(null, clients);
}

function getClient(key, next) {
  findClient(key, (err, i) => {
    return next(null, clients[i]);
  });
}

function createClient(next) {
  let key = incrementKey();
  let client = redisWrapper(key);
  clients.push(client);
  next(null, client);
}

function closeClient(client, next) {
  client.connection.quit();
  findClient(client.id, (err, i) => {
    if (err) {
      return next(err);
    }
    clients.splice(i, 1);
    return next(null);
  });
}

function incrementKey() {
  return ++key;
}

function findClient(key, next) {
  clients.forEach((x, i) => {
    if (key == x.id) {
      return next(null, i);
    }
  });
}

module.exports = {
  getAll: getClients,
  get: getClient,
  create: createClient,
  close: closeClient,
};
