require('dotenv').config();
const Discord = require('discord.js');
const DisTube = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { SpotifyPlugin } = require('@distube/spotify');
const { prefix, allBotCount } = require('./config.json');
const { sendCommandEmbed } = require('./music/misc/sendCommandEmbed');
const editJsonFile = require('edit-json-file');
const playlistFile = editJsonFile('./playlist.json', {autosave: true});
const commandsFile = editJsonFile('./music/json/commands.json');

const queue = new Map();
const bot = parseInt(process.argv.slice(2));

// ----------------------------------------------------------------------
// CMD DICT

if (bot === 0) {
	const { setUpCommandDictionary } = require('./music/setupCommand');
	setUpCommandDictionary();
}


// ----------------------------------------------------------------------
// CLIENT

const client = new Discord.Client({
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.GUILD_VOICE_STATES,
	]
});
const distube = new DisTube.default(
	client,
	{ 
		searchSongs: 1,
		leaveOnStop: false,
		leaveOnEmpty: false,
		plugins: [new SoundCloudPlugin(), new SpotifyPlugin()],
	}
);

const me = 'Dee Bee'+(bot?' '+bot:'');

const playOrQueueMsg = {
	playMessage: null,
	queueEmbed: {
		page: null,
		msg: null
	},
	recentMessage: null
}

client.once('ready', () => {
	console.log('['+me+'] Ready! @JAM-DB-V2');
	client.user.setActivity('\"'+prefix[bot]+'help\" | prefix: '+prefix[bot]);

	// DISTUBE EVENTS
	distube
	// ERROR
	.on('error', (channel, error) => {
		console.error(error);
		channel.send('an error occured... dee bee don kno tho ._.');
	})
	// WHEN SOMETHING PLAYED
	.on('playSong', (q, item) => {
		const mod = require('./music/now-playing');
		const data = { 
			distube: distube,
			message: playOrQueueMsg.recentMessage,
			queue: queue,
			playOrQueueMsg: playOrQueueMsg,
		};
		mod.run(data);
		
		// make func -> console.log(guild, status)
	})
	// WHEN SONG FINISHED
	.on('finishSong', (q, item) => {
		distube.stop(q.textChannel);
		distube.getQueue(q.textChannel).songs = [];

		nextSong(q.textChannel.guildId);
	})
});

client.on('messageCreate', message => {
	if (!message.content.substring(0,prefix[bot].length) == prefix[bot] 
		|| message.author.bot ) 
		return;
	const cmd = processMessage(message);
	if(cmd) {
		message.delete()
		.then(msg => consoleEvent(msg.author.username, msg.content))
		.catch(console.error);
	}
});


// ----------------------------------------------------------------------
// PROCESS

// returns the command name if successful
function processMessage(message) {
	const args = message.content.slice(prefix[bot].length).trim().split(/\s+/);
	const command = args.shift().toLowerCase();
	const commands = commandsFile.toObject();
	const data = { 
		args: args.join(' '),
		distube: distube, 
		message: message,
		queue: queue,
	};
	
	let commandName = null;

	// IF HELP 
	if (command.startsWith('help')) {
		help(message);
		return;
	}
	if (!message.member.voice.channel)
		return message.channel.send(
			"you're not even in a voice channel!!"
		);

	playOrQueueMsg.recentMessage = message;

	// IF COMMAND ID
	if (parseInt(command)) {
		if (commands.names.length <= parseInt(command) || parseInt(command) < 0) {
			message.channel.send('command doesn\'t exist! (hint!! `-help` .^.)');
			return;
		}
		commandName = rcommands.names[parseInt(command)-1]
	} 
	// IF COMMAND ALIAS
	else {
		if (!commands.commandDict[command]) {
			message.channel.send('command doesn\'t exist! (hint!! `-help` .^.)');
			return;
		}
		commands.names.every(cmd => {
			if (commands.commandCode[cmd].includes(command)) {
				commandName = cmd;
				return false;
			}
			return true;
		});
	}
	if (commandName === 'now-playing' || commandName === 'queue') data.playOrQueueMsg = playOrQueueMsg;

	const serverQueue = queue.get(message.guildId);
	if (serverQueue && serverQueue.voiceChannel.id !== message.member.voice.channel.id) {
		return message.channel.send(
			"sorry im on a different channel!!"
		);
	}

	const mod = require(`./music/${commandName}`);
	const obj = mod.run(data);
	// const getType = obj => Object.prototype.toString.call(obj).slice(8, -1);
	// if (obj && getType(obj) === 'Map' && obj.get('fromPlay')) {
	// 	queue = obj.get('queue');
	// }

	return commandName;
}

// for console
function consoleEvent(guild, event, author, content) {
	let divider = '------------------------------------------------------';
	let str = `Guild: ${guild}\nEvent: ${event}\nAuthor: ${author}\nContent: ${content}`;
}

// for next song
function nextSong(guildId) {
	const serverQueue = queue.get(guildId);

	// STOP
	if (serverQueue.isStopped) return;

	// SHUFFLE
	if (serverQueue.isShuffled) {
		if(serverQueue.shuffled.length > serverQueue.shuffleIndex)
			serverQueue.shuffleIndex++;

		// if the next index is out of bounds, remove from shuffle
		if (serverQueue.songs.length <= serverQueue.shuffled[serverQueue.shuffleIndex]) {
			serverQueue.shuffled.splice(serverQueue.shuffleIndex,1);
		}
		if (serverQueue.shuffleIndex >= serverQueue.shuffled.length && serverQueue.loopAll) {
			const mod = require('./music/shuffle');
			mod.run({message: message, queue: serverQueue, replaceArray: true});
			// if the first in shuffled has just played, place it on the end of shuffle
			if ((serverQueue.index === serverQueue.shuffled[0] && serverQueue.shuffled.length > 1)) {
				const temp = serverQueue.shuffled.splice(0,1);
				serverQueue.shuffled.push(temp);
			}
		} else if (serverQueue.shuffleIndex >= serverQueue.shuffled.length && !serverQueue.loopAll) {
			// if not looping queue, set index as "after last song" (index <length>)
			serverQueue.index = serverQueue.songs.length;
			serverQueue.isPlaying = false;
			return;
		}
		serverQueue.index = serverQueue.shuffled[serverQueue.shuffleIndex];
		const message = serverQueue.songs[serverQueue.index].message;
		distube.play(message, serverQueue.songs[serverQueue.index].url);
		return;
	}

	// LINEAR
	console.log(serverQueue.songs.length);
	if(serverQueue.songs.length > serverQueue.index) serverQueue.index++;
	if(serverQueue.songs.length > serverQueue.index) {
		console.log(serverQueue.index);
		const message = serverQueue.songs[serverQueue.index].message;
		distube.play(message, serverQueue.songs[serverQueue.index].url);
	} else {
		if (serverQueue.loopAll) {
			serverQueue.index = 0;
			const message = serverQueue.songs[serverQueue.index].message;
			distube.play(message, serverQueue.songs[0].url);
		} else {
			serverQueue.isPlaying = false;
		}
	}
}

// should create another js for this ??
function help(message) {
	let cstr = '';
	const embed = new Discord.MessageEmbed();
	if (message.content === (`${prefix[bot]}help`)) {
		const {
			names,
			commands,
		} = require('./music/json/helpcommand.json');
		let length = names.length;
		for (let i=0; i<length; i++) {
			cstr += '** (' + (i+1) + ') ' + names[i] + ':**\n> '
			for (let j=0; j<commands[names[i]].length; j++) {
				cstr += commands[names[i]][j] 
				+ (j===commands[names[i]].length-1?'':', ');
			}
			cstr += '\n';
		}

		embed.setColor('#E9C486')
		.setTitle('here are the commands!')
		.setDescription(cstr)
		.setFooter('\"-help (name)\" shows the instructions '
			+'of that command (\'-help loop-one\', \'-help play\')'
			+'\nnote: \"-\" is the prefix'
		);
		message.channel.send({embeds: [embed]});
	} else if (message.content.startsWith(`${prefix[bot]}help `)) {
		const arg = message.content.replace((`${prefix[bot]}help `),'').trim();
		const {
			names,
			definitions,
		} = require('./music/json/helpcommand.json');

		if (names.includes(arg)) {
			definitions[arg].forEach((line) => {
				cstr += line + '\n';
			});
			
			embed.setColor('#E9C486')
			.setTitle('**' + arg + '**')
			.setDescription(cstr);
			message.channel.send({embeds: [embed]});
		} else {
			message.channel.send('invalid command name! :c');
		}
	}
	delete require.cache[require.resolve('./music/json/helpcommand.json')]
	// 👍
}




// ----------------------------------------------------------------------
// LOGIN

client.login(process.env.BOT_TOKENS.split(';')[bot]);


/*
const ffmpegFilters = {
  "3d": "apulsator=hz=0.125",
  bassboost: "bass=g=10,dynaudnorm=f=150:g=15",
  echo: "aecho=0.8:0.9:1000:0.3",
  flanger: "flanger",
  gate: "agate",
  haas: "haas",
  karaoke: "stereotools=mlev=0.1",
  nightcore: "asetrate=48000*1.25,aresample=48000,bass=g=5",
  reverse: "areverse",
  vaporwave: "asetrate=48000*0.8,aresample=48000,atempo=1.1",
  mcompand: "mcompand",
  phaser: "aphaser",
  tremolo: "tremolo",
  surround: "surround",
  earwax: "earwax",
}
*/