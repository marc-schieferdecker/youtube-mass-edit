var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    initSession(req);

    res.render(
        'index', {
            title: 'Bulk edit your videos',
            activeNav: {
                index: true
            },
            cookie: req.session,
            session: session
        }
    );
});

/* GET privacy page. */
router.get('/privacy', function(req, res, next) {
    initSession(req);

    res.render(
        'privacy', {
            title: 'Privacy policy',
            activeNav: {
                index: true
            },
            cookie: req.session,
            session: session
        }
    );
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
    initSession(req);

    res.render(
        'contact', {
            title: 'Developer contact',
            activeNav: {
                index: true
            },
            cookie: req.session,
            session: session
        }
    );
});

module.exports = router;
