const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

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
))
