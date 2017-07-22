const assert = require('assert');
const is = require('is_js');

let connection = {};

// add a new element to a list at a given key. If the list does not exist,
// one is created and the element is added on. Passes an error and the new
// length of the list
function addListItem(key, item, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);

	connection.lpush(key, item, next);
}

// gets an element from a list at a passed index and passes it to a callback.
// if there is an error it is passed to the callback as well.
function getListItem(key, index, next) {
	key = getListKey(key);
	assert.equal(is.number(index), true);
	assert.equal(is.function(next), true);

	checkIndex(key, index, (err, res) => {
		if (err) {
			return next(err);
		}
		assert.equal(res, true);

		getOneElement(key, index, (err, elem) => {
			return next(err, elem);
		});
	});
}

function getList(key, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);
	connection.lrange(key, 0, -1, next);
}

// removes an item from the end of the list and passes it to a callback along
// with an error
function removeListItem(key, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);

	connection.lpop(key, next);
}

// removes all items in the list with the passed value, passes an error and
// the amount of elements removed to the callback
function removeValue(key, value, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);

	connection.lrem(key, 0, value, next);
}

// sets an item at the index with the passed item. Passes an error and
// a database reply to the callback
function setListItem(key, index, item, next) {
	key = getListKey(key);
	assert.equal(is.number(index), true);
	assert.equal(is.function(next), true);

	checkIndex(key, index, (err, res) => {
		if (err) {
			return next(err);
		}
		assert.equal(res, true);
		connection.lset(key, index, item, next);
	});
}

// passes the length of the list and an error to a callback
function getListLength(key, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);

	connection.llen(key, next);
}

// clears the list of all values, and passes all of the args to its callback
function clearList(key, next) {
	key = getListKey(key);
	assert.equal(is.function(next), true);

	getListLength(key, (err, count) => {
		parallelize(removeListItem, count, [key], (...args) => {
			if (args[0]) {
				return next(args[0]);
			}
			return next(...args);
		});
	})
}

//changes the basic key value to a list key
function getListKey(key) {
	if (key.includes('list:')) {
		return key;
	}
	return `list:${key}`;
}

// gets one element from the list at the passed key and the element
// at the passed index. Passes the err and the retrieved element to the
// callback
function getOneElement(key, index, next) {
	connection.lrange(key, index, index, (err, res) => {
		if (err) {
			return next(err);
		}
		assert(is.array(res) && res.length == 1, true);
		return next(null, res[0]);
	});
}

// checks the index is with in the positive and negative bounds of reids
// indecies. Passes an error and a bool representing if it is in bounds.
function checkIndex(key, index, next) {
	getListLength(key, (err, count) => {
		if (index >= count || index <= -count) {
			return next(new Error('Index Out Of Bounds'));
		}
		return next(null, true);
	});
}

// parallelize a task, takes in a task, the amount of tasks, and arrray of args and a
// callback when all tasks are done.
function parallelize(task, count, args, next) {
	let completed = 0;
	for (let i = 0; i < count; i++) {
		task(...args, (...callbackArgs) => {
			if (callbackArgs[0]) {
				return next(...callbackArgs);
			}
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
		all: getList,
	};
}
