const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const RouteManager = require('./util/RouteManager');

const config = require('./config');

const app = express();
//middleware
app.use(morgan('dev'));
app.use(cookieParser('keyboard cat'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'build')));
app.use(passport.initialize());
app.use(passport.session());

//passport
passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	findUser('test', (err, user) => {
		done(err, user);
	})
})

//Routes
const ApiManager = RouteManager(app, config, './routes');
const AuthManager = RouteManager(app, config, './authentication');

app.listen(8080, () => {
	console.log("Server Listening on port 8080");
});


const user = {
	id: 1,
	username: 'test',
	password: 'test',
};

function findUser(username, next) {
	if (username != user.username) {
		return next(true);
	}
	next(null, user);
}
