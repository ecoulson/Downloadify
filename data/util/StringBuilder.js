function StringBuilder() {
	const chars = [];

	function append(value) {
		for (let i = 0; i < value.length; i++) {
			chars.push(value[i]);
		}
	}

	function remove(value) {
		let j = 0;
		let strs = [];
		for (let i = 0; i < chars.length; i++) {
			if (chars[i] == value[j]) {
				let str = chars.slice(i,  i + value.length);
				let matches = true;
				for (let k = 0; k < str.length; k++) {
					if (str[k] != value[j]) {
						matches = false;
						break;
					}
					j++;
				}
				if (matches) {
					chars.splice(i, value.length);
				}
				i = j;
				j = 0;
			}
		}
	}

	let toString = function toString() {
		return chars.reduce((x, char) => {
			return x + char;
		});
	}

	return {
		append: append,
		remove: remove,
		toString: toString,
	};
}

module.exports = StringBuilder;
