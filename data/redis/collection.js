const assert = require('assert');
const is = require('is_js');

const List = require('./list');
let list = {};

const CollectionIDList = 'CollectionID';

let connection = {};
let collectionID = Math.floor(Math.random() * 10);

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
			return next(err);
		}
		assert.equal(is.object(collection), true);
		return next(err, collection);
	});
}


function getCollectionsBy(key, query, next) {
	key = getCollectionKey(key);
	assert.equal(is.function(next), true);

	query.searchCollections((res) => {
		console.log(res);
		return next(null, res);
	})
}

function createCollection(key, info, next) {
	key = getCollectionKey(key);
	assert.equal(is.function(next), true);
	assert.equal(is.object(info), true);
	assert.equal(is.propertyDefined(info, 'type'), true);
	assert.equal(is.propertyDefined(info, 'key'), true);

	info.id = incrementID();

	list.add(CollectionIDList, key, (err, res) => {
		if (err) {
			return next(err);
		}
		connection.hmset(key, info, next);
	});
}

function getAllCollections(next) {
	list.all(CollectionIDList, (err, res) => {
		if (err) {
			return next(err);
		}
		assert.equal(is.array(res), true);
		let collections = [];
		let completed = 0;

		res.forEach((key) => {
			getCollection(key, (err, collection) => {
				if (err) {
					return next(err);
				}
				collections.push(collection);
				if (++completed == res.length) {
					return next(err, collections);
				}
			});
		});
	});
}

function getCollectionKey(key) {
	if (key.includes('collection')) {
		return key;
	}
	return `collection:${key}`;
}

function incrementID() {
	return ++collectionID;
}

module.exports = function collection(rawConnection) {
	connection = rawConnection;
	list = List(connection);
	return {
		get: getCollection,
		getAllBy: getCollectionsBy,
		getAll: getAllCollections,
		create: createCollection,
	};
}
