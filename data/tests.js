module.exports = {
	Client: require('./client'),
	Redis: require('./redis/redis')(2),
};
