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
	// console.log(collection);

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
function referenceCollection(json, stringBuilder, done) {
	assert.equal(is.object(stringBuilder), true);
	let tasks = [];

	let flattened = {};
	for (let key in json) {
		tasks.push((next) => {
			let k = key;
			handleKey(k, json[k], stringBuilder, (value) => {
				flattened[key] = value;
				// console.log(key, ":", value);
				return next();
			});
		});
	}
	executeTasks(tasks, flattened, () => {

		return done(flattened);
	});
}

// handles an objects key and returns a reference string or a primative
// value to be set in the collection
function handleKey(key, value, stringBuilder, next) {
	if (is.array(value)) {
		handleList(key, value, stringBuilder, (value) => {
			return next(value);
		});
	} else if (is.object(value)) {
		handleObject(key, value, stringBuilder, (value) => {
			return next(value);
		});
	} else {
		return next(value);
	}
}

// handles a list by adding it to the database and creating and returning
// its reference string.
function handleList(key, array, stringBuilder, next) {
	let listKey = `/${list.getKey(key)}`;
	stringBuilder.append(listKey);
	let path = stringBuilder.toString();

	let ref = getReferenceString(path);
	array.forEach((elem, i) => {
		handleKey(i, elem, stringBuilder, (item) => {
			list.add(path, item, () => {
				return next(ref);
			});
		});
	});
	stringBuilder.remove(listKey);
}

// handles an object by adding it to the database and creating and returning
// its reference string
function handleObject(key, obj, stringBuilder, next) {
	let collectionKey = `/${Collection.getCollectionKey(key)}`;
	stringBuilder.append(collectionKey);
	let path = stringBuilder.toString();

	let ref = getReferenceString(path);
	referenceCollection(obj, stringBuilder, (info) => {
		info._key = path;
		Collection.simpleCreate(path, info, () => {

			return next(ref);
		});
	});
	stringBuilder.remove(collectionKey);
}

// execute all async tasks in a sequential manner
function executeSequentialTasks(tasks, next) {
	// console.log('here');
	function iterate(index) {
		let task = tasks[index];
		if (index === tasks.length) {
			return next();
		}

		task(() => {
			iterate(index + 1);
		});
	}
	iterate(0);
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
