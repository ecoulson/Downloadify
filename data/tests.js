module.exports = {
	Client: require('./client'),
	Redis: require('./redis')(2),
};
