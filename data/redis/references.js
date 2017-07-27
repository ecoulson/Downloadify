const assert = require('assert');
const is = require('is_js');

let Collection = {};
let list = {};
let connection = {};

// gets all references in collection and returns a javascript object literal
// to the callback
function getReferences(collection, done) {
	assert.equal(is.object(collection), true);
	assert.equal(is.function(done), true);

	const tasks = [];

	for (var k in collection) {
		if (is.string(collection[k]) && collection[k].includes('redisRef:///')) {
			let {type, redisKey} = getRefObj(collection[k]);
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
		assert.equal(is.object(res), true);
		return done(res);
	});
}

// dereferences a hash and updates the javascript object and calls its
// callback
function dereferenceHash(redisKey, key, collection, next) {
	assert.equal(is.function(next), true);

	Collection.get(redisKey, (hash) => {
		getReferences(hash, (dereferencedHash) => {
			collection[key] = dereferencedHash;
			return next();
		});
	});
}

// dereferences array and updates the javascript object and calls its
// callback
function dereferenceArray(redisKey, key, collection, next) {
	assert.equal(is.function(next), true);

	list.all(redisKey, (array) => {
		getReferences(array, (dereferencedArray) => {
			collection[key] = dereferencedArray;
			return next();
		});
	});
}

// executes tasks in parallel and calls a callback passing the javascript
// collection
function executeTasks(tasks, collection, done) {
	assert.equal(is.function(done), true);
	assert.equal(is.array(tasks), true);

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

// sets all references in a collection
function setReferences(json) {
	for (let k in json) {
		if (is.array(json[k])) {
			let ref = `${json._key}/${list.getKey(k)}`;
			json[k].forEach((elem) => {
				list.delete(ref, () => {
					list.add(ref, elem, (value) => {});
				});
			});
			setReferences(json[k]);
			json[k] = ref;
		} else if (is.object(json[k])) {
			let ref = json[k]._key;
			connection.hmset(ref, json[k], () => {});
			setReferences(json[k]);
			json[k] = getReferenceString(ref);
		}
	}
}

// deletes all collections with references in the collection
function deleteReferences(collection) {
	for (var key in collection) {
		if (is.string(collection[key]) && collection[key].includes('redisRef:///')) {
			let {type, redisKey} = getRefObj(collection[key]);
			if (type == 'list') {
				list.delete(redisKey, (array) => {
					deleteReferences(array);
				});
			} else {
				Collection.delete(redisKey, (collection) => {
					deleteReferences(collection);
				});
			}
		}
	}
}

// create new collection by referencing a javascript object literal. Returns
// the referenced object literal.
function referenceCollection(json, stringBuilder) {
	assert.equal(is.object(stringBuilder), true);

	let flattened = {};
	for (let key in json) {
		let value = handleKey(key, json[key], stringBuilder);
		flattened[key] = value;
	}
	return flattened;
}

// handles an objects key and returns a reference string or a primative
// value to be set in the collection
function handleKey(key, value, stringBuilder) {
	if (is.array(value)) {
		return handleList(key, value, stringBuilder);
	} else if (is.object(value)) {
		return handleObject(key, value, stringBuilder);
	} else {
		return value;
	}
}

// handles a list by adding it to the database and creating and returning
// its reference string.
function handleList(key, array, stringBuilder) {
	let listKey = `/${list.getKey(key)}`;
	stringBuilder.append(listKey);
	let path = stringBuilder.toString();
	stringBuilder.remove(listKey);

	let ref = getReferenceString(path);
	array.forEach((elem, i) => {
		let item = handleKey(i, elem, stringBuilder);
		list.add(path, item, (value) => {
		});
	});
	return ref;
}

// handles an object by adding it to the database and creating and returning
// its reference string
function handleObject(key, obj, stringBuilder) {
	let collectionKey = `/${Collection.getCollectionKey(key)}`;
	stringBuilder.append(collectionKey);
	let path = stringBuilder.toString();
	stringBuilder.remove(collectionKey);

	let ref = getReferenceString(path);
	let info = referenceCollection(obj, stringBuilder);
	info._key = path;
	Collection.create(path, info, (success, data) => {
	});
	return ref;
}

// gets the reference object by receiving the reference string
function getRefObj(value) {
	assert.equal(is.string(value), true);

	let redisKey = value.split('redisRef:///')[1];
	let parts = redisKey.split('/');
	let type = parts[parts.length - 1].split(':')[0];
	return {
		type: type,
		redisKey: redisKey,
	};
}

// returns the reference string of a collections path
function getReferenceString(path) {
	return `redisRef:///${path}`;
}

module.exports = function (listLib, collectionLib, client) {
	list = listLib;
	Collection = collectionLib;
	connection = client;
	return {
		getReferenceString: getReferenceString,
		getReferenceObj: getRefObj,
		createReference: referenceCollection,
		deleteReferences: deleteReferences,
		setReferences: setReferences,
		getReferences: getReferences,
	};
}
