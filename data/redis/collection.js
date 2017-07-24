const assert = require('assert');
const is = require('is_js');

const QueryLib = require('../util/query');
const List = require('./list');
let list = {};

const CollectionIDList = 'CollectionID';

let connection = {};
let collectionID = 0;

// Collection is a list a set or a hash
/*

{
	id: 01f783fa
	type: "list",
	key: keyValue,
}

{
	name: "bob",
	age: 15,
	siblings: [] -> Collection,
}

[{},{}] -> [collectionID, collectionID]

*/

// takes in a key and a callback, passes an error and the resulting
// collection to the callback
function getCollection(key, next) {
	key = getCollectionKey(key);
	assert.equal(is.function(next), true);
	connection.hgetall(key, (err, collection) => {
		if (err) {
			return console.error(err);
		}
		assert.equal(is.object(collection), true);
		return next(collection);
	});
}


function getCollectionsBy(queryObj, next) {
	assert.equal(is.function(next), true);

	let query = QueryLib(queryObj, module.exports, connection);

	getAllCollections((collections) => {
		query.searchCollections(collections, next);
	})
}

function createCollection(key, info, next) {
	key = getCollectionKey(key);
	assert.equal(is.function(next), true);
	assert.equal(is.object(info), true);
	assert.equal(is.propertyDefined(info, 'type'), true);
	assert.equal(is.propertyDefined(info, 'key'), true);

	info.id = incrementID();

	list.add(CollectionIDList, key, (res) => {
		info.key = getCollectionKey(info.key);
		connection.hmset(key, info, (err, res) => {
			if (err) {
				return console.error(err);
			}
			assert.equal(is.object(info), true);
			return next(info);
		});
	});
}

function getAllCollections(next) {
	list.all(CollectionIDList, (res) => {
		assert.equal(is.array(res), true);
		let collections = [];
		let completed = 0;

		res.forEach((key) => {
			getCollection(key, (collection) => {
				collections.push(collection);
				if (++completed == res.length) {
					return next(collections);
				}
			});
		});
	});
}

function deleteCollection(key, next) {
	key = getCollectionKey(key);
	assert.equal(is.function(next), true);

	getCollection(key, (collection) => {
		connection.del(collection.key, (err, res) => {
			if (err) {
				return console.error(err);
			}
			list.removeValue(CollectionIDList, collection.key, (count) => {
				return next(res);
			});
		});
	});
}

function setCollection(key, body, next) {
	key = getCollectionKey(key);
	assert.equal(is.object(body), true);
	assert.equal(is.function(next), true);

	let completed = 0;
	let length = Object.keys(body).length;
	connection.hmset(key, body, (err, res) => {
		if (err) {
			return console.error(err);
		}
		getCollection(key, (collection) => {
			return next(collection);
		})
	});
}

function getCollectionKey(key) {
	if (key.includes('collection')) {
		return key;
	}
	return `collection:${key}`;
}

function incrementID(next) {
	return collectionID++;
}

module.exports = function collection(rawConnection) {
	connection = rawConnection;
	list = List(connection);
	return {
		get: getCollection,
		getAllBy: getCollectionsBy,
		getAll: getAllCollections,
		create: createCollection,
		delete: deleteCollection,
		update: setCollection,
	};
}
