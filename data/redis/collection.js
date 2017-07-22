const List = require('./list');
const assert = require('assert');
const is = require('is_js');

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
			return next(err);
		}
		assert.equal(is.object(collection), true);
		return next(err, collection);
	});
}


function getCollectionsBy(key, query, next) {
	key = getCollectionKey(key);
	assert.equal(is.function(next), true);

	query.searchCollections(() => {

	})
}

function createCollection(key, info, next) {
	key = getCollectionKey(key);
	assert.equal(is.function(next), true);
	assert.equal(is.object(info), true);
	assert.equal(is.propertyDefined(info, 'type'), true);
	assert.equal(is.propertyDefined(info, 'key'), true);

	info.id = incrementID();
	List.add(CollectionIDList, id, (err, res) => {
		connection.hmset(key, info, next);
	});
}

function getAllCollections() {
	List.get(Collection)
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
	return {
		get: getCollection,
		getAllBy: getCollectionsBy,
		getAll: getAllCollections,
		create: createCollection,
	};
}
