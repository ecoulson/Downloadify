const assert = require('assert');
const is = require('is_js');
const uniqid = require('uniqid');
const StringBuilder = require('../../util/StringBuilder');

const QueryLib = require('../util/query');
const List = require('./list');
let list = {};

const CollectionIDList = 'CollectionID';

let connection = {};

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

	let query = QueryLib(queryObj);

	getAllCollections((collections) => {
		query.searchCollections(collections, next);
	});
}

function createCollection(key, info, next) {
	assert.equal(info.key, key);
	assert.equal(is.function(next), true);
	assert.equal(is.object(info), true);
	assert.equal(is.propertyDefined(info, 'key'), true);

	key = getCollectionKey(key);
	info.id = getID();

	info = jsonToCollection(info, info.id, getCollectionKey(key));

	addKeyToList(key, (exists) => {
		if (exists) {
			return next(false);
		}
		info.key = getCollectionKey(info.key);
		connection.hmset(key, info, (err, res) => {
			if (err) {
				return console.error(err);
			}
			assert.equal(is.object(info), true);
			return next(true, info);
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
		deleteReferences(collection);
		connection.del(collection.key, (err, res) => {
			if (err) {
				return console.error(err);
			}
			list.removeValue(CollectionIDList, collection.key, (count) => {
				return next(collection);
			});
		});
	});
}

function deleteReferences(collection) {
	for (var key in collection) {
		if (collection[key].includes('redisRef:///')) {
			let redisKey = collection[key].split('redisRef:///')[1];
			let parts = redisKey.split('/');
			let type = parts[parts.length - 1].split(':')[0];
			if (type == 'list') {
				list.delete(redisKey, (array) => {
					deleteReferences(array);
				});
			} else {
				deleteCollection(redisKey, (collection) => {
					deleteReferences(collection);
				})
			}
		}
	}
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
	key += '';
	if (key.includes('collection')) {
		return key;
	}
	return `collection:${key}`;
}

function addKeyToList(key, next) {
	list.contains(CollectionIDList, key, (exists) => {
		if (exists) {
			return next(exists);
		}
		list.add(CollectionIDList, key, (res) => {
			return next(exists);
		});
	});
}

function getID() {
	return uniqid();
}

function jsonToCollection(json, id, path) {
	let flattened = {};
	for (let key in json) {
		let value = handleKey(key, json[key], id, path);
		flattened[key] = value;
	}
	return flattened;
}

function handleKey(key, value, id, path) {
	if (is.array(value)) {
		return handleList(key, value, id, path);
	} else if (is.object(value)) {
		return handleObject(key, value, id, path);
	} else {
		return value;
	}
}

function handleList(key, array, id, path) {
	path = `${path}/${list.getKey(key)}`;
	let ref = collectionRef(id, key, path);
	array.forEach((elem, i) => {
		list.add(path, handleKey(i, elem, id, path), (value) => {
		});
	});
	return ref;
}

function handleObject(key, obj, id, path) {
	path = `${path}/${getCollectionKey(key)}`;
	let ref = collectionRef(id, key, path);
	let info = jsonToCollection(obj, id, path);
	info.key = path;
	createCollection(path, info, (success, data) => {

	});
	return ref;
}

function collectionRef(id, key, path) {
	return `redisRef:///${path}`;
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
