const assert = require('assert');
const is = require('is_js');

let connection = {};

// add a new element to a list at a given key. If the list does not exist,
// one is created and the element is added on. Passes the new
// item to the callback
function addListItem(key, item, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);

	connection.lpush(key, item, (err, res) => {
		if (err) {
			return console.error(err);
		}
		return next(item);
	});
}

// gets an element from a list at a passed index and passes it to a callback.
function getListItem(key, index, next) {
	key = getListKey(key);
	assert.equal(is.number(index), true);
	assert.equal(is.function(next), true);

	checkIndex(key, index, (res) => {
		assert.equal(res, true);
		getOneElement(key, index, (elem) => {
			return next(elem);
		});
	});
}

// gets all values in a list and passes the list as an array to the callback
function getList(key, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);
	connection.lrange(key, 0, -1, (err, res) => {
		if (err) {
			return console.error(err);
		}
		return next(res);
	});
}

// removes an item from the end of the list and passes it to a callback
function removeListItem(key, next) {

	key = getListKey(key);
	assert.equal(is.function(next), true);

	connection.lpop(key, (err, res) => {
		if (err) {
			return console.error(err);
		}
		return next(res);
	});
}

// removes all items in the list with the passed value, passes
// the amount of elements removed to the callback
function removeValue(key, value, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);
	connection.lrem(key, 0, value, (err, res) => {
		if (err) {
			return console.error(err);
		}
		return next(res);
	});
}

// sets an item at the index with the passed item. Passes
// the new value to the callback
function setListItem(key, index, item, next) {
	key = getListKey(key);
	assert.equal(is.number(index), true);
	assert.equal(is.function(next), true);

	checkIndex(key, index, (res) => {
		assert.equal(res, true);
		connection.lset(key, index, item, (err, res) => {
			if (err) {
				return console.error(err);
			}
			return next(item);
		});
	});
}

// passes the length of the list to a callback
function getListLength(key, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);

	connection.llen(key, (err, res) => {
		if (err) {
			return console.error(err);
		}
		return next(res);
	});
}

// clears the list of all values, and passes all of the args to its callback
function clearList(key, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);

	getListLength(key, (count) => {
		parallelize(removeListItem, count, [key], (...args) => {
			if (args[0]) {
				return next(args[0]);
			}
			return next(...args);
		});
	})
}

// checks if an item is contained within a list at the given key. Whether the
// value exists is passed to the callback
function listContains(key, item, next) {
	let contains = false;
	getList(key, (list) => {
		list.forEach((x) => {
			if (x == item) {
				contains = true;
			}
		});
		return next(contains);
	});
}

//changes the basic key value to a list key
function getListKey(key) {
	if (key.includes('list:')) {
		return key;
	}
	return `list:${key}`;
}

// gets one element from the list at the passed key and the element
// at the passed index. Passes the retrieved element to the callback
function getOneElement(key, index, next) {
	connection.lrange(key, index, index, (err, res) => {
		if (err) {
			return console.error(err);
		}
		assert(is.array(res) && res.length == 1, true);
		return next(res[0]);
	});
}

// checks the index is with in the positive and negative bounds of reids
// indecies. Passes a bool representing if it is in bounds.
function checkIndex(key, index, next) {
	getListLength(key, (count) => {
		if (index >= count || index <= -count) {
			throw new Error('Index Out Of Bounds');
		}
		return next(true);
	});
}

// parallelize a task, takes in a task, the amount of tasks, and arrray of args and a
// callback when all tasks are done.
function parallelize(task, count, args, next) {
	let completed = 0;
	for (let i = 0; i < count; i++) {
		task(...args, (...callbackArgs) => {
			if (++completed == count) {
				return next(...callbackArgs);
			}
		});
	}
}

module.exports = function list(rawConnection) {
	connection = rawConnection;
	return {
		add: addListItem,
		get: getListItem,
		set: setListItem,
		remove: removeListItem,
		removeValue: removeValue,
		clear: clearList,
		size: getListLength,
		contains: listContains,
		all: getList,
	};
}
