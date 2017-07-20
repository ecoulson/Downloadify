const router = require('express').Router();

router.get('/users', (req, res, next) => {
	res.send({
		users: [],
	});
});

module.exports = router;
