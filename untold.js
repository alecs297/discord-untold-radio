const Discord = require("discord.js");
const client = new Discord.Client();
const config = require('./config.json');
const request = require('request');

const radio_url = "http://live-untold.distinct.ro:8000/untold.ogg";
const metadata_url = "https://live.distinct.ro/untold/now_playing.php?the_stream=http%3A%2F%2Flive-untold.distinct.ro%3A8000%2Funtold.ogg&callback=__jp13&_=1588273142176";

var np = "the Untold Radio";
var connections = {};

var bassboostargs = ['-af', `equalizer=f=40:width_type=h:width=50:g=10`];

function isCommand(message) {
    if (message.content === "<@!" + client.user.id + ">") {
        message.channel.send("My prefix is `" + config.prefix + "`");
    }
    return (!message.author.bot && message.guild && (message.content.startsWith(config.prefix) || message.content.startsWith("<@!" + client.user.id + ">")) && message.content != "<@!" + client.user.id + ">");
}

function parseCommand(message) {
    var r = {};
    var tag = "<@!" + client.user.id + ">";
    if (message.content.startsWith(config.prefix)) {
        r.args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        r.prefix = config.prefix;
    } else {
        r.args = message.content.slice(tag.length + 1).trim().split(/ +/g);
        r.prefix = tag;
    }
    r.command = r.args.shift().toLowerCase();
    return r;
}

function play(message, is_new, vc = 0) {
    let id = message.guild.id;
    if(!vc) vc = message.member.voice;
    if (connections[id] && message.guild.me.voice && is_new) {
        return message.channel.send("Radio already playing.");
    }
    if (vc.channelID) {
        connections[id] = {};
        if (vc.channel.joinable) {
            if (is_new) {
                message.channel.send("Launching the Radio.");
            }
            vc.channel.join()
            .then(connection => {
                connections[id].stream = connection;
                connections[id].stream.play(radio_url, {encoderArgs: bassboostargs, bitrate: '192000' })
                connections[id].stream.dispatcher.setVolumeLogarithmic(1);
                connections[id].stream.dispatcher.on("end", end => {
                    play(message, 0, vc);
                });
            });
        } else {
            if (is_new) {
                message.channel.send("Can't connect to your channel");
                connections[id] = 0;
            }
        }
    } else {
        message.channel.send("You are not connected to any channel.");
        connections[id] = 0;
    }
}

function pause(message) {
    let id = message.guild.id;
    if (!message.member.voice.channelID) {
        return message.channel.send("You are not connected to any voice chat.");
    }
    if (connections[id]) {
        if (!connections[id].stream.dispatcher.paused) {
            try {
                connections[id].stream.dispatcher.pause();
                message.channel.send("Stream paused!");
            } catch {
                message.channel.send("Couldn't pause the stream.");
            }
        } else {
            message.channel.send("Stream already paused.");
        }
    } else {
        message.channel.send("Nothing to pause.");
    }
}

function resume(message) {
    let id = message.guild.id;
    if (!message.member.voice.channelID) {
        return message.channel.send("You are not connected to any voice chat.");
    }
    if (connections[id]) {
        if (connections[id].stream.dispatcher.paused) {
            try {
                connections[id].stream.dispatcher.resume();
                message.channel.send("Stream resumed!");
            } catch {
                message.channel.send("Couldn't resume the stream.");
            }
        } else {
            message.channel.send("Stream already running.");
        }
    } else {
        message.channel.send("Nothing to resume.");
    }
}

function volume(message, args) {
    let id = message.guild.id;
    if (!message.member.voice.channelID) {
        return message.channel.send("You are not connected to any voice chat.");
    }
    if (connections[id]) {
        if (!args[0]) {
            return message.channel.send("Current volume: `" + connections[id].stream.dispatcher.volumeLogarithmic*100 + "%`");
        }
        if (parseInt(args[0]) < 0 || parseInt(args[0]) > 100) {
            return message.channel.send("You need to specify a value between 0 and 100");
        }
        try {
            connections[id].stream.dispatcher.setVolumeLogarithmic(parseInt(args[0]) / 100);
            message.channel.send("Volume set to `" + parseInt(args[0]) + "%");
        } catch {
            message.channel.send("Couldn't change the volume");
        }
    } else {
        message.channel.send("Nothing is playing");
    }
}
function leave(message, is_requested) {
    let id = message.guild.id;
    let vc = message.guild.me.voice;
    if (!message.member.voice.channelID) {
        return message.channel.send("You are not connected to any voice chat.");
    }
    if (vc.channelID) {
        if (connections[id]) {
            connections[id].stream.dispatcher.destroy();
        }
        vc.channel.leave();
        if (is_requested) {
            message.channel.send("Leaving.");
        }
    } else {
        if (is_requested) {
            message.channel.send("Not connected to any channel.");
        }
    }
    connections[id] = 0;
}

client.on("ready", async => {
    console.log("Connected to discord.");
    var interval = setInterval (async function () {
        await request(metadata_url, (err, res, body) => {
            if (!err) {
                np = body.replace(/&amp/g, "&");
                if (body.toLowerCase().includes("connection")) {
                    np = "the Untold Radio";
                }
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
        if (command === "join" || command === "play") {
            play(message, 1);
        } else if (command === "leave" || command === "stop") {
            leave(message, 1);
        } else if (command === "volume") {
            volume (message, args);
        } else if (command === "pause") {
            pause(message);
        } else if (command === "resume") {
            resume(message);
        } else if (command === "np") {
            if (np.toLowerCase().includes("connection")) {
                message.channel.send("Untold's server doesn't want to share this information with us.")
            } else {
                message.channel.send("Now Playing: " + np);
            }
        } else if (command === "help") {
            let embed = new Discord.MessageEmbed();
            embed.setTitle("Untold Radio");
            embed.setDescription("Created by `Fouiny#0001`, available on GitHub.\nAllows the streaming of the Untold radio in your server at 196kbps. Highly dependent of, well, the Untold Radio. Let's they don't change their gateway too often.");
            embed.addField("Commands", "```Self explanatory commands:\n-join / play\n-leave\n-pause\n-resume\n-np\n-volume```");
            embed.setFooter("Prefix: " + config.prefix + " || Bot's tag.");
            embed.setThumbnail(client.user.avatarURL);
            message.channel.send(embed);
        }
    }
})

client.login(config.token);