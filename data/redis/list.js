const assert = require('assert');

let connection = {};

function addListItem(key, item, next) {
	connection.lpush(key, item, next);
}

function getListItem(key, index, next) {
	connection.lrange(key, index, index, (err, res) => {
		if (err) {
			return next(err);
		}
		assert(Array.isArray(res), true);
		assert(res.length, 1);
		return next(null, res[0]);
	});
}

function removeListItem(key, next) {
	connection.lpop(key, next);
}

function removeValue(key, value, next) {
	connection.lrem(key, 0, value, next);
}

function setListItem(key, index, item, next) {
	connection.lset(key, index, item, next);
}

function getListLength(key, next) {
	connection.llen(key, next);
}

function clearList(key, next) {
	getListLength(key, (err, count) => {
		if (err) {
			return next(err);
		}

		let completed = 0;
		for (let i = 0; i < count; i++) {
			removeListItem(key, (err) => {
				if (err) {
					return next(err);
				}
				completed++;
				if (completed === count) {
					return next(err);
				}
			});
		}
	})
}

function list(rawConnection) {
	connection = rawConnection;
	return {
		add: addListItem,
		get: getListItem,
		set: setListItem,
		remove: removeListItem,
		removeValue: removeValue,
		clear: clearList,
		size: getListLength,
	};
}

module.exports = list;
