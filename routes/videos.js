var express = require('express');
var router = express.Router();
var Youtube = require("youtube-api");

// Load videos from playlist
const getVideosOfPlaylist = (sessionID, playlistId, nextPageToken) => {
    Youtube.playlistItems.list(
        {
            part: "snippet",
            playlistId: playlistId,
            maxResults: 25,
            pageToken: nextPageToken
        },
        (err, playlistResponse) => {
            if (err === null) {
                // Get videos of result
                let videoIds = [];
                for (let j = 0; j < playlistResponse.items.length; j++) {
                    let playlistItem = playlistResponse.items[j];
                    videoIds.push(playlistItem.snippet.resourceId.videoId);
                }

                // Request all videos of page
                Youtube.videos.list(
                    {
                        part: "snippet",
                        id: videoIds.join(',')
                    },
                    (err, video) => {
                        if (err === null) {
                            for (let v = 0; v < video.items.length; v++) {
                                youtubeVideos[sessionID].push(video.items[v]);
                            }

                            // Parse next playlist page
                            nextPageToken = playlistResponse.nextPageToken ? playlistResponse.nextPageToken : null;
                            if (nextPageToken !== null) {
                                getVideosOfPlaylist(sessionID, playlistId, nextPageToken);
                            } else {
                                console.log('Loaded all videos.');
                                console.log('Render: Loading of videos finished.');
                                youtubeVideosLoading[sessionID] = false;
                                youtubeVideosLoadingComplete[sessionID] = true;
                            }
                        } else {
                            console.log(err);
                        }
                    }
                );
            } else {
                console.log(err);
            }
        }
    );
};

// Render videos page
function render(req, res, next, error, view) {
    view = typeof view === 'undefined' ? 'videos' : view;
    error = typeof error === 'undefined' ? '' : error;
    let sessionID = req.session.sessionID;

    // Render page
    res.render(
        view, {
            title: 'Your videos',
            activeNav: {
                videos: true
            },
            youtubeAuthTokens: req.session.youtubeAuthTokens,
            youtubeChannelSnippet: youtubeChannelSnippet[sessionID],
            youtubeVideos: youtubeVideos[sessionID],
            youtubeVideosLoading: youtubeVideosLoading[sessionID],
            youtubeVideosLoadingComplete: youtubeVideosLoadingComplete[sessionID],
            youtubeAuthError: youtubeAuthError[sessionID],
            error: error
        }
    );
}

/* GET video page. */
router.get('/', (req, res, next) => {
    initSession(req);
    let sessionID = req.session.sessionID;

    // Check if we have an access_token
    if(req.session.youtubeAuthTokens.access_token && youtubeAuthError[sessionID] === false) {
        // Set youtube authentication
        Youtube.authenticate({
            type: "oauth",
            client_id: youtubeCredentials.web.client_id,
            client_secret: youtubeCredentials.web.client_secret,
            redirect_url: youtubeCredentials.web.redirect_uris[0],
            access_token: req.session.youtubeAuthTokens.access_token
        });

        // Load channel data and get upload playlist id, if not loaded
        if(youtubeVideos[sessionID].length === 0 && youtubeVideosLoading[sessionID] === false) {
            youtubeVideosLoading[sessionID] = true;
            youtubeVideosLoadingComplete[sessionID] = false;
            Youtube.channels.list(
                {
                    mine: true,
                    part: "snippet,contentDetails"
                },
                (err, data) => {
                    if (err === null) {
                        render(req, res, next);

                        youtubeChannelSnippet[sessionID] = data.items[0].snippet;
                        // Fetch videos from upload playlist and store in session variable (cache)
                        let uploadPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
                        let nextPageToken = '';
                        getVideosOfPlaylist(sessionID, uploadPlaylistId, nextPageToken);
                    } else {
                        youtubeVideos[sessionID] = [];
                        youtubeVideosLoading[sessionID] = false;
                        youtubeVideosLoadingComplete[sessionID] = false;
                        youtubeAuthError[sessionID] = true;

                        render(req, res, next);
                    }
                }
            );
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
    let sessionID = req.session.sessionID;

    if(typeof req.body.videoId === 'object') {
        if(req.session.youtubeAuthTokens.access_token && youtubeAuthError[sessionID] === false && youtubeVideos[sessionID].length) {
            // Set youtube authentication
            Youtube.authenticate({
                type: "oauth",
                client_id: youtubeCredentials.web.client_id,
                client_secret: youtubeCredentials.web.client_secret,
                redirect_url: youtubeCredentials.web.redirect_uris[0],
                access_token: req.session.youtubeAuthTokens.access_token
            });

            for (i = 0; i < req.body.videoId.length; i++) {
                let videoId = req.body.videoId[i];
                let videoDescription = req.body.videoDescription[i];
                if (videoId && videoDescription) {
                    // Get existing youtube video snippet data
                    let videoSnippet = null;
                    for( j = 0; i < youtubeVideos[sessionID].length; j++) {
                        if(youtubeVideos[sessionID][j].id === videoId) {
                            videoSnippet = youtubeVideos[sessionID][j].snippet;
                            youtubeVideos[sessionID][j].snippet.description = videoDescription;
                            break;
                        }
                    }
                    // Send update
                    if(videoSnippet !== null) {
                        Youtube.videos.update(
                            {
                                part: "snippet",
                                resource: {
                                    id: videoId,
                                    snippet: {
                                        title: videoSnippet.title,
                                        categoryId: videoSnippet.categoryId,
                                        defaultLanguage: videoSnippet.defaultLanguage,
                                        description: videoDescription,
                                        tags: videoSnippet.tags
                                    }
                                }
                            },
                            (err, data) => {
                                if (err !== null) {
                                    console.log(err);
                                    render(req, res, next, err.errors[0].reason, 'update');
                                }
                                else {
                                    console.log('Video ' + videoId + ' updated.');
                                }
                            }
                        );
                    }
                }
            }
            render(req, res, next, '', 'update');
        }
        else {
            render(req, res, next, 'auth', 'update');
        }
    }
    else {
        render(req, res, next, 'nodata','update');
    }
});

module.exports = router;
