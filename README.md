# discord-untold-radio
### A Discord bot for streaming Untold's festival radio (https://www.untold.com/)

## What's Untold and why this bot?
> Untold is an EDM Romanian festival, this bot streams their official radio direclty in your Discord server. The bot comes with a little bit of bass boosting. You can clone this bot or invite mine directly from https://discordapp.com/oauth2/authorize?client_id=471635574172942337&scope=bot

## Requirements
> You will first need nodejs and npm. You also need to install `discord-js`, `node-opus` and `request` in your project folder. Node opus requires `ffmpeg` so install that as well.
To install a package use `npm i packagename`

## Configuration
>Change the `config.json` file to fit your needs. It will need your Discord bot token and you can also change bot's prefix from there.

## Usage
`node untold.js`
> The bot should be connecting to discord. If the bot's status doesn't change according to the songs' name / doesn't stream the radio at all it means Untold changed the way their radio works (again). I'll try to keep this to date and working.

## Commands
> `play`, `join`, `leave`, `stop`, `np`, `pause`, `resume`, `volume` and `help`. They are quite self-explanatory.
You can tag the bot in order to get its prefix or use the tag as the prefix itself
