const assert = require('assert');
const is = require('is_js');
const uniqid = require('uniqid');
const StringBuilder = require('../../util/StringBuilder');

const QueryLib = require('../util/query');
const List = require('./list');
let list = {};

const CollectionIDList = 'CollectionID';

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
		getReferences(collection, (data) => {
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

function getReferences(collection, done) {
	const tasks = [];

	for (var k in collection) {
		if (is.string(collection[k]) && collection[k].includes('redisRef:///')) {
			let {type, redisKey} = getKeyObj(collection[k]);
			if (type == 'list') {
				let key = k;
				tasks.push((next) => {
					dereferenceArray(redisKey, key, collection, next);
				});
			} else {
				let key = k;
				tasks.push((next) => {
					dereferenceHash(redisKey, key, collection, next);
				});
			}
		}
	}

	executeTasks(tasks, collection, (res) => {
		return done(res);
	});
}

function dereferenceHash(redisKey, key, collection, next) {
	getCollection(redisKey, (hash) => {
		getReferences(hash, (dereferencedHash) => {
			collection[key] = dereferencedHash;
			return next();
		});
	});
}

function dereferenceArray(redisKey, key, collection, next) {
	list.all(redisKey, (array) => {
		getReferences(array, (dereferencedArray) => {
			collection[key] = dereferencedArray;
			return next();
		});
	});
}

function executeTasks(tasks, collection, done) {
	let completed = 0;
	if (tasks.length == 0) {
		return done(collection);
	}
	tasks.forEach((task) => {
		task(() => {
			if (++completed == tasks.length) {
				return done(collection);
			}
		})
	})
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

	key = getCollectionKey(key);
	info._key = key;
	info._id = getID();

	info = jsonToCollection(info, info.id, getCollectionKey(key));

	addKeyToList(key, (exists) => {
		if (exists) {
			return next(false);
		}
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
		deleteReferences(collection);
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

function deleteReferences(collection) {
	for (var key in collection) {
		if (is.string(collection[key]) && collection[key].includes('redisRef:///')) {
			let {type, redisKey} = getKeyObj(collection[key]);
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

	getCollection(key, (collection) => {
		let updatedCollection = combineObjects(collection, body);
		setReferences(updatedCollection, updatedCollection._key);
		return next(collection);
	});
}

function setReferences(json) {
	for (let k in json) {
		if (is.array(json[k])) {
			let ref = `${json._key}/${list.getKey(k)}`;
			json[k].forEach((elem) => {
				list.add(ref, elem, () => {});
			});
			setReferences(json[k]);
			json[k] = ref;
		} else if (is.object(json[k])) {
			let ref = json[k]._key;
			connection.hmset(ref, json[k], () => {});
			setReferences(json[k]);
			json[k] = collectionRef(ref);
		}
	}
}

function setList(array, path, key) {
	setReferences(array);
	return collectionRef(`${path}/${list.getKey(key)}`);
}

function combineObjects(collection, body) {
	for (var k in collection) {
		if (body.hasOwnProperty(k)) {
			if (is.object(collection[k])) {
				body[k] = combineObjects(collection[k], body[k]);
			}
			collection[k] = body[k];
		}
	}
	return collection;
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
	let ref = collectionRef(path);
	array.forEach((elem, i) => {
		list.add(path, handleKey(i, elem, id, path), (value) => {});
	});
	return ref;
}

function handleObject(key, obj, id, path) {
	path = `${path}/${getCollectionKey(key)}`;
	let ref = collectionRef(path);
	let info = jsonToCollection(obj, id, path);
	info._key = path;
	createCollection(path, info, (success, data) => {});
	return ref;
}

function getKeyObj(value) {
	let redisKey = value.split('redisRef:///')[1];
	let parts = redisKey.split('/');
	let type = parts[parts.length - 1].split(':')[0];
	return {
		type: type,
		redisKey: redisKey,
	};
}

function collectionRef(path) {
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
