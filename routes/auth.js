var Promise = require("bluebird");
var express = require('express');
var router = express.Router();
var Youtube = require("youtube-api");
var ytmasseditHelper = require("../modules/ytmassedit-helper-module");
var oauth = {}; // OAuth client object

// Render auth page
function render(req, res, next, result) {
    result = typeof result !== 'undefined' ? result : false;

    // Render page
    res.render(
        'auth', {
            title: 'Authenticate',
            activeNav: {
                auth:true
            },
            result: result,
            session: session.getData(req.session.sessionID),
            cookie: req.session
        }
    );
}

/**
 * Show auth page
 */
router.get('/', (req, res, next) => {
    initSession(req);

    // Check auth with a simple request on own channel
    ytmasseditHelper.ytAuthenticate( youtubeCredentials, req.session.youtubeAuthTokens );
    ytmasseditHelper.ytCheckAuth()
    .then((data) => {
        render(req, res, next, data);
    }).catch((error) => {
        session.setYoutubeVideosLoading(req.session.sessionID,false);
        session.setYoutubeVideosLoadingComplete(req.session.sessionID,false);
        session.setYoutubeAuthError(req.session.sessionID,true);
        render(req, res, next, error);
    });
});

/**
 * Oauth with API
 */
router.get('/oauth', function(req, res, next) {
    initSession(req);

    // Auth
    if(youtubeCredentials.web) {
        oauth = ytmasseditHelper.ytAuthenticate( youtubeCredentials );
        res.redirect(ytmasseditHelper.ytGetAuthURL());
    }
});

/**
 * Genereate and store auth token
 */
router.get('/callback', function(req, res, next) {
    initSession(req);

    ytmasseditHelper.ytGetTokens(oauth,req.query.code)
    .then((tokens) => {
        req.session.youtubeAuthTokens = tokens;
        session.setYoutubeAuthError(req.session.sessionID,false);
        render(req, res, next, tokens);
    }).catch((error) => {
        render(req, res, next, error);
    });
});

module.exports = router;
