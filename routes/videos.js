var express = require('express');
var router = express.Router();
var Youtube = require("youtube-api");
var ytmasseditHelper = require("../modules/ytmassedit-helper-module");

// Render videos page
function render(req, res, next, result, view) {
    view = typeof view === 'undefined' ? 'videos' : view;
    error = typeof error === 'undefined' ? '' : error;

    // Render page
    res.render(
        view, {
            title: 'Your videos',
            activeNav: {
                videos: true
            },
            result: result,
            session: session.getData(req.session.sessionID),
            cookie: req.session
        }
    );
}

/* GET video page. */
router.get('/', (req, res, next) => {
    initSession(req);

    // Check if we have an access_token
    if(req.session.youtubeAuthTokens.access_token && session.getYoutubeAuthError(req.session.sessionID) === false) {
        // Set youtube authentication
        ytmasseditHelper.ytAuthenticate(youtubeCredentials,req.session.youtubeAuthTokens);

        // Load channel data and get upload playlist id, if not loaded
        if(session.getYoutubeVideos(req.session.sessionID).length === 0 && session.getYoutubeVideosLoading(req.session.sessionID) === false) {
            session.setYoutubeVideosLoading(req.session.sessionID,true);
            session.setYoutubeVideosLoadingComplete(req.session.sessionID,false);

            ytmasseditHelper.ytGetUploadPlaylist()
                .then((data)=>{
                    session.setYoutubeChannelSnippet(req.session.sessionID,data.items[0].snippet);
                    // Fetch videos from upload playlist and store in session variable (cache)
                    let uploadPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
                    let nextPageToken = '';
                    ytmasseditHelper.getVideosOfPlaylist(req.session.sessionID, uploadPlaylistId, nextPageToken);

                    render(req, res, next);
                })
                .catch((error)=>{
                    session.setYoutubeVideos(req.session.sessionID,[]);
                    session.setYoutubeVideosLoading(req.session.sessionID,false);
                    session.setYoutubeVideosLoadingComplete(req.session.sessionID,false);
                    session.setYoutubeAuthError(req.session.sessionID,true);

                    render(req, res, next);
                });
        }
        else {
            render(req, res, next);
        }
    }
    else {
        render(req, res, next);
    }
});

/* POST update page */
router.post('/update', (req, res, next) => {
    initSession(req);

    if(typeof req.body.videoId === 'object') {
        if(req.session.youtubeAuthTokens.access_token && session.getYoutubeAuthError(req.session.sessionID) === false && session.getYoutubeVideos(req.session.sessionID).length) {
            // Set youtube authentication
            ytmasseditHelper.ytAuthenticate(youtubeCredentials,req.session.youtubeAuthTokens);

            for (i = 0; i < req.body.videoId.length; i++) {
                let videoId = req.body.videoId[i];
                let videoDescription = req.body.videoDescription[i];
                if (videoId && videoDescription) {
                    // Get existing youtube video snippet data
                    let videoSnippet = null;
                    for( j = 0; i < session.getYoutubeVideos(req.session.sessionID).length; j++) {
                        if(session.getYoutubeVideos(req.session.sessionID)[j].id === videoId) {
                            videoSnippet = session.getYoutubeVideos(req.session.sessionID)[j].snippet;
                            videoSnippet.description = videoDescription;
                            session.setYouTubeVideoSnippet(req.session.sessionID,j,videoSnippet);
                            break;
                        }
                    }
                    // Send update
                    if(videoSnippet !== null) {
                        ytmasseditHelper.ytUpdateVideo(videoId, videoSnippet.title, videoSnippet.categoryId, videoSnippet.defaultLanguage, videoSnippet.description, videoSnippet.tags);
                    }
                }
            }
            render(req, res, next, '', 'update');
        }
        else {
            render(req, res, next, {error:'auth'}, 'update');
        }
    }
    else {
        render(req, res, next, {error:'nodata'},'update');
    }
});

module.exports = router;
