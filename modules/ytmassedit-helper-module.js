/**
 * YTMassEdit helper module
 */
let self = module.exports = {
    Youtube: require("youtube-api"),

    /**
     * Set google auth tokens
     * @param credentials
     * @param tokens
     * @returns {*}
     */
    ytAuthenticate: (credentials, tokens) => {
        if(typeof tokens === 'undefined') {
            return self.Youtube.authenticate({
                type: "oauth",
                client_id: credentials.web.client_id,
                client_secret: credentials.web.client_secret,
                redirect_url: credentials.web.redirect_uris[0]
            });
        }
        else
        if(typeof tokens.refresh_token === 'undefined') {
            return self.Youtube.authenticate({
                type: "oauth",
                client_id: credentials.web.client_id,
                client_secret: credentials.web.client_secret,
                redirect_url: credentials.web.redirect_uris[0],
                access_token: tokens.access_token
            });
        }
        else {
            return self.Youtube.authenticate({
                type: "oauth",
                client_id: credentials.web.client_id,
                client_secret: credentials.web.client_secret,
                redirect_url: credentials.web.redirect_uris[0],
                refresh_token: tokens.refresh_token
            });
        }
    },

    /**
     * Get URL to start oauth
     * @param oauthclient
     * @returns {*}
     */
    ytGetAuthURL: (oauthclient) => {
        return oauthclient.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/youtube",
                "https://www.googleapis.com/auth/youtube.readonly",
                "https://www.googleapis.com/auth/youtube.upload",
                "https://www.googleapis.com/auth/youtube.force-ssl",
                "https://www.googleapis.com/auth/youtubepartner"
            ]
        });
    },

    /**
     * Get tokens
     * @param oauthclient
     * @param code
     */
    ytGetTokens: (oauthclient, code) => {
        return new Promise( (resolve,reject) => {
            if(code) {
                oauthclient.getToken(code, (err, tokens) => {
                    if (err === null) {
                        oauthclient.setCredentials(tokens);
                        resolve(tokens);
                    }
                    else {
                        console.log(err);
                        reject(err);
                    }
                });
            }
            else {
                console.log('code missing');
                reject('code missing');
            }
        });
    },

    /**
     * Check if google auth is valid
     */
    ytCheckAuth: () => {
        return new Promise((resolve, reject) => {
            self.Youtube.channels.list(
                {
                    mine: true,
                    part: "id"
                },
                (err, data) => {
                    if (err === null) {
                        resolve(data);
                    }
                    else {
                        console.log(err);
                        reject(err);
                    }
                }
            );
        });
    },

    /**
     * Get own upload playlist
     */
    ytGetUploadPlaylist: () => {
        return new Promise((resolve, reject) => {
            self.Youtube.channels.list(
                {
                    mine: true,
                    part: "snippet,contentDetails"
                },
                (err, data) => {
                    if (err === null) {
                        resolve(data);
                    }
                    else {
                        console.log(err);
                        reject(err);
                    }
                }
            );
        });
    },

    /**
     * Get all videos of a playlist (async and store state in global session variables)
     * @param playlistId
     * @param nextPageToken
     */
    getVideosOfPlaylist: async (sessionID, playlistId, nextPageToken) => {
        self.Youtube.playlistItems.list(
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
                    self.Youtube.videos.list(
                        {
                            part: "snippet",
                            id: videoIds.join(',')
                        },
                        (err, video) => {
                            if (err === null) {
                                for (let v = 0; v < video.items.length; v++) {
                                    session.addYouTubeVideo(sessionID,video.items[v]);
                                }

                                // Parse next playlist page
                                nextPageToken = playlistResponse.nextPageToken ? playlistResponse.nextPageToken : null;
                                if (nextPageToken !== null) {
                                    self.getVideosOfPlaylist(sessionID, playlistId, nextPageToken);
                                } else {
                                    // Loading complete
                                    session.setYoutubeVideosLoading(sessionID,false);
                                    session.setYoutubeVideosLoadingComplete(sessionID,true);
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
    },

    /**
     * Update video (async and store result in global session variables)
     * @param id
     * @param title
     * @param categoryId
     * @param defaultLanguage
     * @param description
     * @param tags
     * @returns {Promise<void>}
     */
    ytUpdateVideo: async (sessionID, id, title, categoryId, defaultLanguage, description, tags) => {
        self.Youtube.videos.update(
            {
                part: "snippet",
                resource: {
                    id: id,
                    snippet: {
                        title: title,
                        categoryId: categoryId,
                        defaultLanguage: defaultLanguage,
                        description: description,
                        tags: tags
                    }
                }
            },
            (err, data) => {
                if (err === null) {
                    session.addYoutubeVideosUpdateLog(sessionID, {
                        id: id,
                        title: title,
                        result: 'success',
                        error: null
                    });
                }
                else {
                    session.addYoutubeVideosUpdateLog(sessionID, {
                        id: id,
                        title: title,
                        result: 'error',
                        error: err
                    });
                    console.log(err);
                }
            }
        );
    },

};
