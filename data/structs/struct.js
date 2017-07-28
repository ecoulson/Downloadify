const StructListKey = 'StructKeys';
const Client = require('../client');

function Struct(structureName, structure) {
	const client = Client.create();
	const list = client.List;
	const collection = client.Collection;
	const key = getStructKey(structureName);

	function storeStructure() {
		list.add(StructListKey, key, () => {
			let typedStructure = parseStruct();
			client.connection.set(key, '', (err, res) => {
				console.log();
			});
		});
	}

	function getStructKey() {
		return `struct:${structureName}`;
	}

	function parseStruct() {

	}

	storeStructure();
}

module.exports = Struct;

/*

const User = Struct('user', {
	id: Number,
	username: String,
	name: {
		type: Object,
		structure: {
			{
				firstName: String,
				LastName: String,
			},
		}
	}
	password: String,
	email: String,
	dateJoined: { type: Date, default: Date.now() },
	lastLogin: Date,
	shapes: Array,
	icons: Object,
});

module.exports = user

*/
