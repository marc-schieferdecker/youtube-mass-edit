Youtube Mass Edit
=================

This little tools helps you too bulk edit all of your YouTube videos descriptions.

It is written in javascript/express.js and uses the YouTube API (OAuth2).

Installation and usage
======================

You will need...

* Node.js
* npm
* YouTube API credentials file (OAuth)

**Install**

1) Download sources to your local computer or a server and unpack
2) Head to console.cloud.google.com create a project, activate the YouTube API v3 and create OAuth2 web app credentials (set callback url to "http://localhost:3000/auth/callback")
3) Download the JSON credential file and save it to "google-credentials.json" in the main directory of the application  
4) Open console / bash / gitbash / cmd / whatever you use
5) Change to the directory where you unpacked the sources
6) Run "npm i" to install all node modules
7) Run "node start" (or try "node bin/www" if you get an error)
8) Run browser and open "http://localhost:3000/"

**Usage**

1) Authenticate with OAuth2
2) Edit your videos descriptions
3) Submit changes

Notices
=======

The YouTube API only will let you do a maximum of 10,000 requests per 24 hours and updating a video will count 52 requests. So if you update 400 videos that will not work on a single day. Thx Google... 

Use carefully! There is no way to undo submitted changes!

I wrote the tool to bulk edit the videos descriptions of my own YouTube channel so do not expect support or a high end application. ;)
