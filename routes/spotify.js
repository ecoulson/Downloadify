const express = require('express');
const router = express.Router();

router.get('/spotify', (req, res, next) => {
	res.send('Hello Dog');
})

router.get('/spotify/auth', (req, res, next) => {
	res.send('<h1>Hello big dog </h1>');
});

router.get('/spotify/auth/callback', (req, res, next) => {
	res.send('<h1>Hello big dog 2</h1>');
});



module.exports = router;
