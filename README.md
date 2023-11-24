This version uses deprecated versions of discordjs packages.

# Introduction
JAM-DB
John Angelo's Machine: Discord Bot

The discord bot's name is deebee, and its primary purpose is to be a music bot. 

Uses packages like discordjs/opus, ffmpeg, etc., but most of the libraries used are already deprecated.

# Requirements
1. Need a _.env_ file with the `BOT_TOKEN`
2. Execute `npm install` command to install dependencies.
3. Run `npm test` for testing purposes.
4. Run `npm start` to start deebees. There are 5 deebees which are run by concurrently.

# Files
1. The directory `music` contains all the functions of deebee.
2. The directory `music/json` contains some settings and the list of commands.
3. The directory `music/misc` contains helper functions.
4. The file `server.js` is an older version of the system.
5. The file `deebee.js` is the actual server.
