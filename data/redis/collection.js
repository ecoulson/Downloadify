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
		query.searchCollections(collections, (err, matches) => {
			if (err) {
				return next(err);
			}
			return next(err, matches);
		})
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
		connection.hmset(key, info, (err, res) => {
			if (err) {
				return console.error(err);
			}
			return next(res);
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

function getCollectionKey(key) {
	if (key.includes('collection')) {
		return key;
	}
	return `collection:${key}`;
}

function incrementID() {
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
	};
}
