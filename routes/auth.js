var express = require('express');
var router = express.Router();
var Youtube = require("youtube-api");
var oauth = {};

// Render auth page
function render(req, res, next) {
    let sessionID = req.session.sessionID;

    // Render page
    res.render(
        'auth', {
            title: 'Authenticate',
            activeNav: {
                auth:true
            },
            youtubeAuthTokens: req.session.youtubeAuthTokens,
            youtubeAuthError: youtubeAuthError[sessionID]
        }
    );
}

/**
 * Show auth page
 */
router.get('/', function(req, res, next) {
    initSession(req);
    let sessionID = req.session.sessionID;

    // Check auth with a simple request on own channel
    if(req.session.youtubeAuthTokens.access_token) {
        Youtube.authenticate({
            type: "oauth",
            client_id: youtubeCredentials.web.client_id,
            client_secret: youtubeCredentials.web.client_secret,
            redirect_url: youtubeCredentials.web.redirect_uris[0],
            access_token: req.session.youtubeAuthTokens.access_token
        });
        Youtube.channels.list(
            {
                mine: true,
                part: "id"
            },
            (err, data) => {
                if (err !== null) {
                    youtubeVideosLoading[sessionID] = false;
                    youtubeVideosLoadingComplete[sessionID] = false;
                    youtubeAuthError[sessionID] = true;
                }
                render(req, res, next);
            }
        );
    } else {
        render(req, res, next);
    }
});

/**
 * Oauth with API
 */
router.get('/oauth', function(req, res, next) {
    initSession(req);

    // Auth
    if(youtubeCredentials.web) {
        oauth = Youtube.authenticate({
            type: "oauth",
            client_id: youtubeCredentials.web.client_id,
            client_secret: youtubeCredentials.web.client_secret,
            redirect_url: youtubeCredentials.web.redirect_uris[0]
        });
        res.redirect(oauth.generateAuthUrl({
            access_type: "online",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/youtube",
                "https://www.googleapis.com/auth/youtube.readonly",
                "https://www.googleapis.com/auth/youtube.upload",
                "https://www.googleapis.com/auth/youtube.force-ssl",
                "https://www.googleapis.com/auth/youtubepartner"
            ]
        }));
    }
});

/**
 * Store auth token
 */
router.get('/callback', function(req, res, next) {
    initSession(req);
    let sessionID = req.session.sessionID;

    if(req.query.code) {
        oauth.getToken(req.query.code, (err, tokens) => {
            req.session.youtubeAuthTokens = tokens;
            youtubeAuthError[sessionID] = false;
            oauth.setCredentials(tokens);
            render(req, res, next);
        });
    }
    else {
        render(req, res, next);
    }
});

module.exports = router;
