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

module.exports = router;
