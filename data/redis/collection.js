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
	assert.equal(is.function(next), true);

	key = getCollectionKey(key);
	assert.equal(is.function(next), true);
	connection.hgetall(key, (err, collection) => {
		if (err) {
			return console.error(err);
		}
		assert.equal(is.object(collection), true);
		Reference.getReferences(collection, (data) => {
			assert.equal(is.object(collection), true);
			return next(data);
		});
	});
}

// gets a collection and does not dereference any collections and lists.
// Passes the referenced collection to the callback
function getCollectionWithReferences(key, next) {
	assert.equal(is.function(next), true);

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

// gets collections by passed queryObject. returns an array of collections
// to the callback
function getCollectionsBy(queryObj, next) {
	assert.equal(is.function(next), true);

	let query = QueryLib(queryObj);

	getAllCollections((collections) => {
		assert.equal(is.array(collections), true);
		query.searchCollections(collections, next);
	});
}

// creates a collection at the passed key using the json data and returns
// wether or not the creation was successful and the object to the callback
function createCollection(key, data, next) {
	assert.equal(is.function(next), true);
	assert.equal(is.object(data), true);

	let json = data;
	let sb = StringBuilder();

	key = getCollectionKey(key);
	data._key = key;
	data._id = getID();

	addKeyToList(key, (exists) => {
		if (exists) {
			return next(false);
		}
		sb.append(getCollectionKey(key));
		data = Reference.createReference(data, sb);
		data._key = getCollectionKey(data._key);
		connection.hmset(key, data, (err, res) => {
			if (err) {
				return console.error(err);
			}
			assert.equal(is.object(data), true);
			return next(true, json);
		});
	});
}

// gets all collections in the database and returns an array of them to
// the callback
function getAllCollections(next) {
	list.all(CollectionIDList, (res) => {
		assert.equal(is.array(res), true);
		let collections = [];
		let completed = 0;

		res.forEach((key) => {
			getCollection(key, (collection) => {
				assert.equal(is.object(collection), true);
				collections.push(collection);
				if (++completed == res.length) {
					return next(collections);
				}
			});
		});
	});
}

// deletes the collection at the key and returns the collection that was
// deleted to the callback
function deleteCollection(key, next) {
	key = getCollectionKey(key);
	assert.equal(is.function(next), true);

	getCollectionWithReferences(key, (collection) => {
		Reference.deleteReferences(collection);
		assert.equal(is.string(collection._key), true);
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

// sets the collection at the key to have the new values passed by the
// json body and returns the new collection to the callback
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

// Combines two javascript object literals and sets keys in the collection
// to the new values in body and returns the new javascript object
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
	assert.equal(is.object(collection), true);
	return collection;
}

// adds the collection key to the list of all the collection keys and returns
// whether or not the key exists to the callback;
function addKeyToList(key, next) {
	list.contains(CollectionIDList, key, (exists) => {
		assert.equal(is.boolean(exists), true);
		if (exists) {
			return next(exists);
		}
		list.add(CollectionIDList, key, (res) => {
			return next(exists);
		});
	});
}

//returns unique id from npm
function getID() {
	return uniqid();
}

//returns the collectionKey of a simple key
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
