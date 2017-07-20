const router = require('express').Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const user = {
	id: 1,
	username: 'test',
	password: 'test',
};

passport.use(new LocalStrategy(
	function (username, password, next) {
		findUser(username, (err, user) => {
			if (err) {
				return next(err);
			}
			if (!user) {
				return next(null, false);
			}
			if (password != user.password) {
				return next(null, false);
			}
			return next(null, user);
		})
	}
));

router.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    res.send('test');
  }
);

function findUser(username, next) {
	if (username != user.username) {
		return next(true);
	}
	next(null, user);
}

module.exports = router;
