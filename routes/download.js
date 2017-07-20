const express = require('express');
const router = express.Router();

router.post('/download/spotify/url', (req, res, next) => {

});

router.get('/download/spotify/url', (req, res, next) => {
	res.send('u  r gae');
});

module.exports = router;
