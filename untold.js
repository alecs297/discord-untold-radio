const Discord = require("discord.js");
const client = new Discord.Client();
const config = require('./config.json');
const request = require('request');

const radio_url = "http://live-untold.distinct.ro:8000/untold.ogg";
const metadata_url = "https://live.distinct.ro/untold/now_playing.php?the_stream=http%3A%2F%2Flive-untold.distinct.ro%3A8000%2Funtold.ogg&callback=__jp13&_=1588273142176"

var np = "Untold's Radio";
var connections = {};

function isCommand(message) {
    if (message.content === "<@!" + client.user.id + ">") {
        message.channel.send("My prefix is `" + config.prefix + "`");
    }
    return (!message.author.bot && message.guild && (message.content.startsWith(config.prefix) || message.content.startsWith("<@!" + client.user.id + ">")) && message.content != "<@!" + client.user.id + ">");
}

function parseCommand(message) {
    var r = {};
    var tag = message.content.startsWith("<@!" + client.user.id + ">")
    if (message.content.startsWith(config.prefix)) {
        r.args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        r.prefix = config.prefix;
    } else {
        r.args = message.content.slice(tag.length);
        r.prefix = tag;
    }
    r.command = args.shift().toLowerCase();
    return r;
}

client.on("ready", async => {
    console.log("Connected to discord.");
    var interval = setInterval (async function () {
        await request(metadata_url, (err, res, body) => {
            if (!err) {
                np = body;
            }
        });
        client.user.setActivity(np, {type: 'LISTENING'});
    }, 10000);
});

client.on('message', async message => {
    if (isCommand(message)) {
        var r = parseCommand(message);
        var command = r.command;
        var args = r.args;
        if (command === "join") {

        } else if (command === "leave") {

        } else if (command === "volume") {

        } else if (command === "pause") {

        } else if (command === "play" || command === "resume") {

        } else if (command === "np") {

        } else if (command === "help") {
            
        }
    }
})

client.login(config.token);