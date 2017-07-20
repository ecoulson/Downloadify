const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const RouteManager = require('./RouteManager');

const config = require('./config');

const app = express();
//middleware
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());

//Routes
const ApiManager = RouteManager(app, config, './routes');
const AuthManager = RouteManager(app, config, './authentication');

app.listen(8080, () => {
	console.log("Server Listening on port 8080");
});
