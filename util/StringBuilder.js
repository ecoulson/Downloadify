function StringBuilder() {
	const strings = [];

	let append = function append(value) {
		strings.push(value);
	}

	let toString = function toString() {
		return strings.reduce((x, string) => {
			return x + string;
		});
	}

	return {
		append: append,
		toString: toString,
	};
}

module.exports = StringBuilder;
