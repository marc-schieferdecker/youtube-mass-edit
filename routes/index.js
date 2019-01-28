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
            youtubeAuthTokens: req.session.youtubeAuthTokens
        }
    );
});

module.exports = router;
