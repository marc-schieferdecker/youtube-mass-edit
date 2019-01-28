var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var cookieSession = require('cookie-session');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var expressHandlebars = require("express-handlebars");

// Load config
conf = require('./config.json');

// Load YouTube API credentials
youtubeCredentials = require(conf.googleCredentialsFile);

// Global variables for storage because session can not be used (google-api does not support promises!
youtubeChannelSnippet = {};
youtubeVideos = {};
youtubeVideosLoading = {};
youtubeVideosLoadingComplete = {};
youtubeAuthError = {};

// Configure routes
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var videosRouter = require('./routes/videos');

// Create app
var app = express();

// Session
app.set('trust proxy', 1); // trust first proxy
app.use(cookieSession({
    name: 'session',
    secret: 'ytmassedit',
    maxAge: 24 * 60 * 60 * 1000 * 7 // 1 week
}));
// Init session variables function
initSession = (req) => {
    if(typeof req.session.youtubeAuthTokens !== 'object') {
        req.session.youtubeAuthTokens = {};
    }
    if(typeof req.session.sessionID !== 'string') {
        req.session.sessionID = crypto.randomBytes(20).toString('hex');
    }
    if(typeof youtubeChannelSnippet[req.session.sessionID] === 'undefined') {
        youtubeChannelSnippet = {
            [req.session.sessionID]: {}
        };
    }
    if(typeof youtubeVideos[req.session.sessionID] === 'undefined') {
        youtubeVideos = {
            [req.session.sessionID]: []
        };
    }
    if(typeof youtubeVideosLoading[req.session.sessionID] === 'undefined') {
        youtubeVideosLoading = {
            [req.session.sessionID]: false
        };
    }
    if(typeof youtubeVideosLoadingComplete[req.session.sessionID] === 'undefined') {
        youtubeVideosLoadingComplete = {
            [req.session.sessionID]: false
        };
    }
    if(typeof youtubeAuthError[req.session.sessionID] === 'undefined') {
        youtubeAuthError = {
            [req.session.sessionID]: false
        };
    }
};

// View engine setup (handlebars)
app.engine("hbs", expressHandlebars({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: require("./public/javascripts/handlebars.js").helpers,
    partialsDir: "views/partials/",
    layoutsDir: "views/layouts/"
}));
app.set("view engine", "hbs");

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Url routes mapping
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/videos', videosRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
