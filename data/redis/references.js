const assert = require('assert');
const is = require('is_js');

let Collection = {};
let list = {};
let connection = {};

function getReferences(collection, done) {
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
		return done(res);
	});
}

function dereferenceHash(redisKey, key, collection, next) {
	Collection.get(redisKey, (hash) => {
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

function referenceCollection(json, sb) {
	let flattened = {};
	for (let key in json) {
		let value = handleKey(key, json[key], sb);
		flattened[key] = value;
	}
	return flattened;
}

function handleKey(key, value, sb) {
	if (is.array(value)) {
		return handleList(key, value, sb);
	} else if (is.object(value)) {
		return handleObject(key, value, sb);
	} else {
		return value;
	}
}

function handleList(key, array, sb) {
	sb.append(`/${list.getKey(key)}`);
	let path = sb.toString();
	let ref = getReferenceString(path);
	array.forEach((elem, i) => {
		let item = handleKey(i, elem, path);
		list.add(path, item, (value) => {
		});
	});
	return ref;
}

function handleObject(key, obj, sb) {
	sb.append(`/${Collection.getCollectionKey(key)}`);
	let path = sb.toString();
	let ref = getReferenceString(path);
	let info = referenceCollection(obj, sb);
	info._key = path;
	Collection.create(path, info, (success, data) => {});
	return ref;
}

function getRefObj(value) {
	let redisKey = value.split('redisRef:///')[1];
	let parts = redisKey.split('/');
	let type = parts[parts.length - 1].split(':')[0];
	return {
		type: type,
		redisKey: redisKey,
	};
}

function getReferenceString(path) {
	return `redisRef:///${path}`;
}

module.exports = function (l, c, C) {
	list = l;
	Collection = c;
	connection = C;

	return {
		getReferenceString: getReferenceString,
		getReferenceObj: getRefObj,
		createReference: referenceCollection,
		deleteReferences: deleteReferences,
		setReferences: setReferences,
		getReferences: getReferences,
	};
}
