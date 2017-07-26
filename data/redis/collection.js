const assert = require('assert');
const is = require('is_js');
const uniqid = require('uniqid');

const ReferenceFactory = require('./references');
const StringBuilder = require('../../util/StringBuilder');
const QueryLib = require('../util/query');
const List = require('./list');

const CollectionIDList = 'CollectionID';
let list = {};
let Reference = {};
let connection = {};

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
		Reference.getReferences(collection, (data) => {
			return next(data);
		});
	});
}

function getCollectionWithReferences(key, next) {
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
	assert.equal(is.function(next), true);
	assert.equal(is.object(info), true);

	let sb = StringBuilder();

	key = getCollectionKey(key);
	info._key = key;
	info._id = getID();

	addKeyToList(key, (exists) => {
		if (exists) {
			return next(false);
		}
		sb.append(getCollectionKey(key));
		info = Reference.createReference(info, sb);
		info._key = getCollectionKey(info._key);
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

	getCollectionWithReferences(key, (collection) => {
		Reference.deleteReferences(collection);
		connection.del(collection._key, (err, res) => {
			if (err) {
				return console.error(err);
			}
			list.removeValue(CollectionIDList, collection._key, (count) => {
				return next(collection);
			});
		});
	});
}

function setCollection(key, body, next) {
	key = getCollectionKey(key);
	assert.equal(is.object(body), true);
	assert.equal(is.function(next), true);

	getCollection(key, (collection) => {
		let updatedCollection = combineObjects(collection, body);
		Reference.setReferences(updatedCollection, updatedCollection._key);
		return next(collection);
	});
}

function combineObjects(collection, body) {
	for (var k in collection) {
		if (body.hasOwnProperty(k)) {
			if (is.array(collection[k])) {
				body[k] = collection[k];
			} else if (is.object(collection[k])) {
				body[k] = combineObjects(collection[k], body[k]);
			}
			collection[k] = body[k];
		}
	}
	return collection;
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

function getCollectionKey(key) {
	key += '';
	if (key.includes('collection')) {
		return key;
	}
	return `collection:${key}`;
}

module.exports = function collection(rawConnection) {
	const returns = {
		get: getCollection,
		getAllBy: getCollectionsBy,
		getAll: getAllCollections,
		create: createCollection,
		delete: deleteCollection,
		update: setCollection,
		getCollectionKey: getCollectionKey,
	}

	connection = rawConnection;
	list = List(connection);
	Reference = ReferenceFactory(list, returns, connection);
	return returns;
}
