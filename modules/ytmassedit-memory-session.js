/**
 * Store things session dependent in the memory
 */
let self = module.exports = {
    youtubeChannelSnippet: {},
    youtubeVideos: {},
    youtubeVideosLoading: {},
    youtubeVideosLoadingComplete: {},
    youtubeVideosUpdateLog: {},
    youtubeAuthError: {},

    init: (id) => {
        if (typeof self.youtubeChannelSnippet[id] === 'undefined') {
            self.youtubeChannelSnippet[id] = {};
        }

        if (typeof self.youtubeVideos[id] === 'undefined') {
            self.youtubeVideos[id] = [];
        }

        if (typeof self.youtubeVideosLoading[id] === 'undefined') {
            self.youtubeVideosLoading[id] = false;
        }

        if (typeof self.youtubeVideosLoadingComplete[id] === 'undefined') {
            self.youtubeVideosLoadingComplete[id] = false;
        }

        if (typeof self.youtubeVideosUpdateLog[id] === 'undefined') {
            self.youtubeVideosUpdateLog[id] = [];
        }

        if (typeof self.youtubeAuthError[id] === 'undefined') {
            self.youtubeAuthError[id] = false;
        }
    },

    setYoutubeChannelSnippet: (id,snippet) => {
        self.youtubeChannelSnippet[id] = snippet;
    },

    getYoutubeChannelSnippet: (id) => {
        return self.youtubeChannelSnippet[id];
    },

    setYoutubeVideos: (id,videos) => {
        self.youtubeVideos[id] = videos;
    },

    getYoutubeVideos: (id) => {
        return self.youtubeVideos[id];
    },

    addYouTubeVideo: (id,video) => {
        self.youtubeVideos[id].push(video);
    },

    setYouTubeVideoSnippet: (id,index,snippet) => {
        self.youtubeVideos[id][index].snippet = snippet;
    },

    setYoutubeVideosLoading: (id,value) => {
        self.youtubeVideosLoading[id] = value;
    },

    getYoutubeVideosLoading: (id) => {
        return self.youtubeVideosLoading[id];
    },

    setYoutubeVideosLoadingComplete: (id,value) => {
        self.youtubeVideosLoadingComplete[id] = value;
    },

    getYoutubeVideosLoadingComplete: (id) => {
        return self.youtubeVideosLoadingComplete[id];
    },

    setYoutubeVideosUpdateLog: (id,value) => {
        self.youtubeVideosUpdateLog[id] = value;
    },

    addYoutubeVideosUpdateLog: (id,value) => {
        self.youtubeVideosUpdateLog[id].push(value);
    },

    getYoutubeVideosUpdateLog: (id) => {
        return self.youtubeVideosUpdateLog[id];
    },

    setYoutubeAuthError: (id,value) => {
        self.youtubeAuthError[id] = value;
    },

    getYoutubeAuthError: (id) => {
        return self.youtubeAuthError[id];
    },

    /**
     * Get data
     */
    getData: (id) => {
        return {
            sessionId: id,
            youtubeChannelSnippet: self.getYoutubeChannelSnippet(id),
            youtubeVideos: self.getYoutubeVideos(id),
            youtubeVideosLoading: self.getYoutubeVideosLoading(id),
            youtubeVideosLoadingComplete: self.getYoutubeVideosLoadingComplete(id),
            youtubeVideosUpdateLog: self.getYoutubeVideosUpdateLog(id),
            youtubeAuthError: self.getYoutubeAuthError(id),
        }
    }

};