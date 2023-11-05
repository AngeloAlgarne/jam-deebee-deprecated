const Discord = require('discord.js');
const ytdl = require('ytdl-core')
const ytpl = require('ytpl');
const ytsr = require('ytsr');
const VoiceDiscord = require('@discordjs/voice');
const editJsonFile = require('edit-json-file');
const { prefix } = require('./config.json');
const file = editJsonFile('./playlist.json', {autosave: true});
let playlistLimit = 20;
require('dotenv').config();

for (let botId=0; botId<1; botId++) {
	let uselessCounter = 0;
	const queue = new Map();
	let recentMessage = null;
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

	client.once('ready', () => {
		console.log('Ready!');
	});
	client.once('reconnecting', () => {
		console.log('Reconnecting!');
	});
	client.once('disconnect', () => {
		console.log('Disconnect!');
	});
	client.on('error', err => {
		console.error(err);
	})

	client.on('messageCreate', async message => {
		message.content.toLowerCase();
		message.content = message.content.trim();
		recentMessage = message;

		// IF DEE BEE OR OTHER BOTS
		if (message.author.bot) {
			return;
		}

		// WALA LANG
		if (message.content === 'hi dee bee!' || message.content === 'hi deebee!') {
			message.channel.send('hello!!');
			return;
		} else if (message.content === 'hello dee bee!' || message.content === 'hello deebee!') {
			message.channel.send('hii! c:');
			return;
		} else if (message.content === ('nice one deebee') || message.content === ('nice deebee')) {
			message.channel.send('thanks! c:');
			return;
		}

		// IF MESSAGE IS NOT COMMAND
		if (!message.content.startsWith(prefix[botId])) return;
		
		// IF MESSAGE IS COMMAND
		const serverQueue = queue.get(message.guild.id);
		if(serverQueue) {
			if (message.channel !== serverQueue.textChannel) { // if incorrect channel
				return message.channel.send('cannot perform actions here... terminate my operations first and play here again!');
			}
		}

		// CHECK WHAT COMMAND
		if (message.content.startsWith(`${prefix[botId]}play `) || message.content.startsWith(`${prefix[botId]}p `)) {
			execute(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}play`) || message.content === (`${prefix[botId]}p`)) {
			staticPlay(message, serverQueue);
			return;
		}  else if (message.content === (`${prefix[botId]}q`) || message.content === (`${prefix[botId]}queue`)) {
			showQueue(message, serverQueue);
			return;
		}  else if (message.content === (`${prefix[botId]}skip`) || message.content === (`${prefix[botId]}next`)) {
			skip(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}back`) || message.content === (`${prefix[botId]}prev`) || message.content === (`${prefix[botId]}previous`)) {
			back(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}stop`)) {
			stop(message, serverQueue);
			return;
		}else if (message.content.startsWith(`${prefix[botId]}q-`) || message.content.startsWith(`${prefix[botId]}queue-`)) {
			navigateQueue(message, serverQueue);
			return;
		} else if (message.content.startsWith(`${prefix[botId]}r `) || message.content.startsWith(`${prefix[botId]}remove `)) {
			remove(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}pause`)) {
			pause(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}unpause`)) {
			unpause(message, serverQueue);
			return;
		} else if (message.content.startsWith(`${prefix[botId]}bye`) || message.content === (`${prefix[botId]}kill`) 
			|| message.content === (`${prefix[botId]}die`) || message.content === (`${prefix[botId]}terminate`)) {
			bye(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}dc`) || message.content === (`${prefix[botId]}disconnect`)) {
			disconnect(message, serverQueue);
			return;
		} else if (message.content.startsWith(`${prefix[botId]}j `) || message.content.startsWith(`${prefix[botId]}jump `)) {
			jump(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}clear`)) {
			clearQueue(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}loop1`) || message.content === (`${prefix[botId]}l1`)) {
			loop1(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}loop`) || message.content === (`${prefix[botId]}l`)) {
			loop(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}playing`)) {
			nowPlaying(message, serverQueue);
			return;
		} else if (message.content.startsWith(`${prefix[botId]}help`)) {
			help(message);
			return;
		} else if (message.content === (`${prefix[botId]}shuffle`)) {
			shuffle(message, serverQueue);
			return;
		} else if (message.content.startsWith(`${prefix[botId]}save `)) {
			savePlaylist(message, serverQueue);
			return;
		} else if (message.content.startsWith(`${prefix[botId]}load `)) {
			loadPlaylist(message, serverQueue);
			return;
		} else if (message.content.startsWith(`${prefix[botId]}playlist`) || message.content.startsWith(`${prefix[botId]}pl`)) {
			playlist(message, serverQueue);
			return;
		} else if (message.content === (`${prefix[botId]}repeat`)) {
			repeat(message, serverQueue);
			return;
		}
		// else if (message.content.startsWith(`${prefix[botId]}debug `)) {
		// 	search(message.content.replace('-debug ',''), serverQueue);
		// }
		else if (message.content === ('-> [ram]?')) {
			message.channel.send((process.memoryUsage().heapUsed / 1024 / 1024) + 'mb');
		}
	});

	client.on('messageReactionAdd', (reaction, user) => {
		if(user.bot) return;
		processReaction(reaction, user);
	});

	client.on('messageReactionRemove', (reaction, user) => {
		if(user.bot) return;
		processReaction(reaction, user);
	});

	function processReaction(reaction, user) {
		const serverQueue = queue.get(reaction.message.guildId);
	    if (serverQueue) {
	    	if (serverQueue.queueEmbed.msg) {
	    		if(reaction.message.id === serverQueue.queueEmbed.msg.id) {
	    			let maxPages = Math.ceil(serverQueue.songs.length/10);
		    		if(reaction.emoji.name === '◀️') {
		    			showQueue(
		    				reaction.message, 
		    				serverQueue, 
		    				(serverQueue.queueEmbed.page === 1 ? 
		    					maxPages : serverQueue.queueEmbed.page-1), 
		    				true
		    			);
					} else if (reaction.emoji.name === '▶️') {
						showQueue(
							reaction.message, 
							serverQueue, 
							(serverQueue.queueEmbed.page === maxPages ? 
								1 :  serverQueue.queueEmbed.page+1), 
							true
						);
					}
		    	}
	    	}
	    }
	}
	// DONE
	async function execute(message, serverQueue) {
		// PROCESS INPUT
		const args = message.content.split(/[\n,]+/);
		if(args[0].trim() === (`${prefix[botId]}p`) || args[0].trim() === (`${prefix[botId]}play`)) {
			args.splice(0,1);
		} else { 
			if (args[0].includes((`${prefix[botId]}play `))) {
				args[0] = args[0].replace((`${prefix[botId]}play `),'').trim();
			} else if (args[0].includes((`${prefix[botId]}p `))) {
				args[0] = args[0].replace((`${prefix[botId]}p `),'').trim();
			}
		}
		// VALIDATION 
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) return message.channel.send(
			"join a voice channel first!"
		);
		const permissions = voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
			return message.channel.send(
			"i need the permissions to join and speak in your voice channel!"
			);
		}
		if (args.length === 0) {
			return message.channel.send('play nani??');
		}

		// CHECK SERVER QUEUE
		if (!serverQueue) { // if no server queue, create one
			serverQueue = createServerQueue(message, serverQueue)
			if (!serverQueue) {
				console.log('Failed to create serverQueue... '
					+'could be something wrong with createServerQueue function');
				return;
			}
		}

		// PROCESS URLs
		let addedSongs = 0;
		for (let i=0; i<args.length; i++) {
			try {
				if (ytpl.validateID(args[i])) {
					// IF PLAYLIST
					const songpl = await ytpl(args[i], {limit: 1000});
					songpl.items.forEach((item) => {
						const song = {
							title: item.title.trim(),
							url: item.shortUrl.trim(),
							duration: item.duration.trim(),
							by: message.author.id,
						};
						addedSongs++;
						serverQueue.songs.push(song)
					});
				} else {
					// IF NOT PLAYLIST
					const filter = await ytsr.getFilters(args[i]);
					const filter1 = filter.get('Type').get('Video');
					const result = await ytsr(filter1.url, { limit: 10 });
					const array = [];
					for (let i=1; i<result.items.length; i++) {
						if (!result.items[i].isLive 
							&& result.items[i].title 
							&& result.items[i].url
							&& result.items[i].duration) {
							array.push({
								title: result.items[i].title.trim(),
								url: result.items[i].url.trim(),
								duration: result.items[i].duration.trim(),
							});
						}
					}
					const song = {
						title: result.items[0].title.trim(),
						url: result.items[0].url.trim(),
						duration: result.items[0].duration.trim(),
						by: message.author.id,
						backup: array,
					};
					addedSongs++;
					serverQueue.songs.push(song);
				}
			} catch (err) {
				console.error(err);
			}
			if (i === 0 && !(serverQueue.isPlaying || serverQueue.isStopped || serverQueue.isPaused)) {
				// played instantly if queue has finished last song (unless looped)
				console.log('index: ' + serverQueue.index);
				play(message.guild, serverQueue.songs[serverQueue.index]);
			} 
		}

		// MULTIPLE INPUTS PROMPT
		if(addedSongs > 1) {
			const embed = new Discord.MessageEmbed()
			.setColor('#E9C486')
			.setDescription('**'+ addedSongs + ' songs** added to queue list!');
			serverQueue.textChannel.send({embeds: [embed]});
			showQueue(message,serverQueue);
		} 

		// ONLY ONE SONG ADDED TO QUEUE
		else if (addedSongs === 1) { 
			const embed = new Discord.MessageEmbed()
			.setColor('#E9C486')
			.setDescription('**'+ serverQueue.songs[serverQueue.songs.length-1].title 
				+ '** added to queue list!');
			serverQueue.textChannel.send({embeds: [embed]});
		}
	}
	// DONE
	function createServerQueue(message, serverQueue) {
		const newPlayer = VoiceDiscord.createAudioPlayer();
		const voiceChannel = message.member.voice.channel;
		const queueConstruct = {
			queueEmbed: {
				page: null,
				msg: null,
			},
			playingEmbed: {
				msg: null,
			},
			player: newPlayer,
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			index: 0,
			volume: 5,
			isPlaying: false,
			isPaused: false,
			isStopped: false,
			isShuffled: false,
			shuffled: [],
			shuffleIndex: 0,
			loopAll: false,
			loopOne: false,
		};

		queue.set(message.guild.id, queueConstruct);
		serverQueue = queueConstruct;
		try {
			const connection = VoiceDiscord.joinVoiceChannel({
				channelId: message.member.voice.channelId,
				guildId: message.guild.id,
				adapterCreator: message.guild.voiceAdapterCreator,
			});
			connection.subscribe(newPlayer);
			serverQueue.connection = connection;

			serverQueue.player.on(VoiceDiscord.AudioPlayerStatus.Idle, () => {
				// STOPPED
				if (serverQueue.isStopped) return;

				// LOOP ONE
				if (serverQueue.loopOne) {
					play(message.guild, serverQueue.songs[serverQueue.index]);
					return;
				}

				// SHUFFLE
				if (serverQueue.isShuffled) {
					if(serverQueue.shuffled.length > serverQueue.shuffleIndex)
						serverQueue.shuffleIndex++;

					// if the next index is out of bounds, remove from shuffle
					if (serverQueue.songs.length <= serverQueue.shuffled[serverQueue.shuffleIndex]) {
						serverQueue.shuffled.splice(serverQueue.shuffleIndex,1);
					}
					if (serverQueue.shuffleIndex >= serverQueue.shuffled.length && serverQueue.loopAll) {
						shuffle(null, serverQueue);
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
					play(message.guild, serverQueue.songs[serverQueue.index]);
					return;
				}

				// LINEAR
				if(serverQueue.songs.length > serverQueue.index) serverQueue.index++;
				if(serverQueue.songs.length > serverQueue.index) {
					play(message.guild, serverQueue.songs[serverQueue.index]);
				} else {
					if (serverQueue.loopAll) {
						play(message.guild, serverQueue.songs[0]);
						serverQueue.index = 0;
					} else {
						serverQueue.isPlaying = false;
					}
				}
			}).on("error", error => {
				const song = serverQueue.songs[serverQueue.index];
				if (song.backup) {
					if (song.backup.length > 0) {
						const item = song.backup.splice(0,1);
						song.title = item.title;
						song.url = item.url;
						song.duration = item.duration;
						play(message.guild, song);
						return;
					}
				}
				console.error(error);
			});
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
		} finally {
			return serverQueue;
		}
	}

	async function playlist(message, serverQueue) {
		const guildId = message.guild.id;
		let data = file.toObject()[guildId];
		if (!data) {
			file.set(message.guild.id, {});
			file.set(message.guild.id+'.name', [])
			file.set(message.guild.id+'.playlist', {});
			file.set(message.guild.id+'.allowed', {});
		}
		data = file.toObject()[guildId];
		if (message.content === (`${prefix[botId]}pl`) || message.content === (`${prefix[botId]}playlist`)) {	
			if (data.name.length === 0) {
				const embed = new Discord.MessageEmbed()
				.setColor('#E9C486')
				.setDescription('no playlists saved!');
				message.channel.send({embeds : [embed]});
			} else {
				let plstr = '';
				const playlists = data.name;
				let ctr = 1;
				playlists.forEach(pl => {
					let ostr = '';
					data.allowed[pl].forEach(o => {
						ostr += '<@' + o + '> ';
					});
					plstr += ctr + '. `' + pl + '`\n> owned by '+ostr+'\n';
					ctr++;
				});

				const embed = new Discord.MessageEmbed()
				.setColor('#E9C486')
				.setTitle('saved playlists!')
				.setDescription(plstr)
				.setFooter(data.name.length + ' playlist(s); limited to '+playlistLimit+' playlists;');
				message.channel.send({embeds : [embed]});
			}

			return;
		} else if (message.content.split(/\s+/).length > 1) {
			let plName = (
				message.content.startsWith(`${prefix[botId]}playlist`) ? 
				message.content.replace((`${prefix[botId]}playlist`), '') :
				message.content.replace((`${prefix[botId]}pl`), '')
			).trim();

			// REMOVE
			if (plName.startsWith('-r') || plName.startsWith('-remove')) {
				plName = (
					plName.startsWith('-remove') ? 
					plName.replace('-remove', '') :
					plName.replace('-r', '')
				).trim();

				if(!plName) {
					message.channel.send('what... what\'s the playlist name? .v.\'');
					return;
				}

				if (data.name.includes(plName)) {
					if (data.allowed[plName].includes(message.author.id)) {
						for (let i=0; i<data.name.length; i++) {
							if (data.name[i] === plName) {
								data.name.splice(i, 1);
								file.unset(guildId+'.playlist.'+plName);
								file.unset(guildId+'.allowed.'+plName);
							}
						}
						const embed = new Discord.MessageEmbed()
						.setColor('#E9C486')
						.setDescription('**'+plName+'** - removed!');
						message.channel.send({embeds : [embed]});
					} else {
						const embed = new Discord.MessageEmbed()
						.setColor('#E9C486')
						.setDescription('you dont have the permission to edit this playlist! '
							+'kindly ask the owner(s) of this playlist first :c');
						message.channel.send({embeds : [embed]});
					}
				} else {
					const embed = new Discord.MessageEmbed()
					.setColor('#E9C486')
					.setDescription('playlist not found!');
					message.channel.send({embeds : [embed]});
				}
			} 
			// SAVE
			else if (plName.startsWith('-s') || plName.startsWith('-save')) {
				if (isServerQueueNull(message, serverQueue)) return;

				plName = (
					plName.startsWith('-save') ? 
					plName.replace('-save', '') :
					plName.replace('-s', '')
				).trim();

				if(!plName) {
					message.channel.send('what... what\'s the playlist name? .v.\'');
					return;
				}

				if (data.name.includes(plName)) {
					if (data.allowed[plName].includes(message.author.id)) {
						file.set(guildId+'.playlist.'+plName, serverQueue.songs);
						const embed = new Discord.MessageEmbed()
						.setColor('#E9C486')
						.setDescription('**'+plName+'** - saved!');
						message.channel.send({embeds : [embed]});
					} else {
						const embed = new Discord.MessageEmbed()
						.setColor('#E9C486')
						.setDescription('you dont have the permission to edit this playlist! '
							+'kindly ask the owner(s) of this playlist first :c');
						message.channel.send({embeds : [embed]});
					}
				} else {
					data.name.push(plName);
					file.set(guildId+'.playlist.'+plName, serverQueue.songs);
					file.set(guildId+'.allowed.'+plName, [message.author.id]);
					const embed = new Discord.MessageEmbed()
					.setColor('#E9C486')
					.setDescription('**'+plName+'** added as new playlist!');
					message.channel.send({embeds : [embed]});
				}
			} 
			// ALLOW
			else if (plName.startsWith('-a') || plName.startsWith('-allow')) {
				plName = (
					plName.startsWith('-allow') ? 
					plName.replace('-allow', '') :
					plName.replace('-a', '')
				).trim().split(/\s+/);

				if (plName.length !== 2) {
					const embed = new Discord.MessageEmbed()
					.setColor('#E9C486')
					.setDescription('incorrect number of inputs!\ncommand: `-pl-a <username> <playlist>`');
					message.channel.send({embeds : [embed]});
					return;
				}

				if (data.name.includes(plName[1])) {
					if (data.allowed[plName[1]].includes(message.author.id)) {
						let id = null;
						if (plName[0].startsWith('<@')) {
							id = plName[0].replace(/[^0-9]/g,'');
						} else {
							const member = await message.guild.members.search({query:plName[0]});
							id = member.firstKey();
						}
						file.append(guildId+'.allowed.'+plName[1], id);
						const embed = new Discord.MessageEmbed()
						.setColor('#E9C486')
						.setDescription('<@'+id+'> is now allowed to edit **' + plName[1] + '**');
						message.channel.send({embeds : [embed]});
					} else {
						const embed = new Discord.MessageEmbed()
						.setColor('#E9C486')
						.setDescription('you dont have the permission to issue this command! '
							+'kindly ask the owner(s) of this playlist first :c');
						message.channel.send({embeds : [embed]});
					}
				} else {
					const embed = new Discord.MessageEmbed()
					.setColor('#E9C486')
					.setDescription('playlist not found!');
					message.channel.send({embeds : [embed]});
				}
			} 
			// ADD PLAYLIST TO QUEUE
			else {
				if (data.name.includes(plName)) {
					if (!serverQueue) {
						serverQueue = createServerQueue(message, serverQueue);
					}

					const list = data.playlist[plName];
					list.forEach(s => {
						serverQueue.songs.push(s);
					});
					if (!(serverQueue.isPlaying || serverQueue.isStopped || serverQueue.isPaused)) {
						play(message.guild, serverQueue.songs[serverQueue.index]);
					}
					const embed = new Discord.MessageEmbed()
					.setColor('#E9C486')
					.setDescription('**'+ list.length + ' song(s)** added to queue list!');
					serverQueue.textChannel.send({embeds: [embed]});
					showQueue(message,serverQueue);
				} else {
					const embed = new Discord.MessageEmbed()
					.setColor('#E9C486')
					.setDescription('playlist not found!');
					message.channel.send({embeds : [embed]});
				}
			}
		}
	}
	// DONE
	function shuffle(message, serverQueue) {
		if(message!==null && serverQueue!==null) {
			serverQueue.isShuffled = !serverQueue.isShuffled;
			const embed = new Discord.MessageEmbed()
			.setColor('#E9C486')
			.setDescription('**shuffle** is now **' 
				+ (serverQueue.isShuffled ? 'on' : 'off') +'**!');
			serverQueue.textChannel.send({embeds: [embed]});
		}
		if (serverQueue.isShuffled) {
			// Fisher-Yates (aka Knuth) Shuffle
			const array = [];
			for(let i=0; i<serverQueue.songs.length;i++) array.push(i);
			let currentIndex = array.length,  randomIndex;
			while (currentIndex != 0) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;
				[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
			}
			serverQueue.shuffled = array;
			serverQueue.shuffleIndex = 0;
		}
	}
	// DONE
	function loop(message, serverQueue) {
		// loop queue
		const initVal = serverQueue.loopOne;
		serverQueue.loopAll = serverQueue.loopAll ? false : true;
		serverQueue.loopOne = serverQueue.loopAll ? false : serverQueue.loopOne;

		const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setDescription('\"looping queue\" has been turned **' 
			+ (serverQueue.loopAll ? 'on' : 'off') +'**!'
			+ (initVal ? '\nno longer looping one song c:' : ''));
		serverQueue.textChannel.send({embeds: [embed]});
	}
	// DONE
	function loop1(message, serverQueue) {
		// loop one song
		serverQueue.loopOne = serverQueue.loopOne ? false : true;

		const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setDescription('\"looping current song\" has been turned **' 
			+ (serverQueue.loopOne ? 'on' : 'off') +'**!');
		serverQueue.textChannel.send({embeds: [embed]});
	}
	// DONE
	function repeat(message, serverQueue) {
		stop(message, serverQueue);
		if(!serverQueue) return;
		const timer = ms => new Promise( res => setTimeout(res, ms));
		timer(500)
		.then(_=>
			play(message.guild, serverQueue.songs[serverQueue.index])
		);
	}
	// DONE
	function jump(message, serverQueue) {
		const args = message.content.trim().split(/\s+/);
		let index = parseInt(args[1]);
		if (args[1] === 'last') index = serverQueue.songs.length;
		if (!index) return message.channel.send("cant jump there... invalid input! :<");
		index--;
		if (index === serverQueue.index) return message.channel.send("already playing!");

		serverQueue.index = index;
		play(message.guild, serverQueue.songs[index]);
	}
	// DONE
	function skip(message, serverQueue) {
		if (!message.member.voice.channel) return message.channel.send(
			"you're not even in a voice channel!!"
		);
		if (isServerQueueNull(message, serverQueue)) return;

		// when AudioPlayer stops, it enters idle state...
		// see function "play(guild, song)" to know what happens
		// when AudioPlayer enters idle state.
		return serverQueue.player.stop();
	}
	// DONE
	function back(message, serverQueue) {
		if (!message.member.voice.channel) return message.channel.send(
			"you're not even in a voice channel!!"
		);
		if (isServerQueueNull(message, serverQueue)) return;

		if(!serverQueue.isShuffled) {
			serverQueue.index = Math.max(serverQueue.index - 1, 0);
			play(message.guild, serverQueue.songs[serverQueue.index]);
		} else {
			serverQueue.shuffleIndex = Math.max(serverQueue.shuffleIndex - 1, 0);
			serverQueue.index = serverQueue.shuffled[serverQueue.shuffleIndex];
			play(message.guild, serverQueue.songs[serverQueue.index]);
		}
	}
	// DONE
	function stop(message, serverQueue) {
		if (!message.member.voice.channel) return message.channel.send(
			"you're not even in a voice channel!!"
		);
		if (isServerQueueNull(message, serverQueue)) return;

		serverQueue.isPlaying = false;
		serverQueue.isStopped = true;

		serverQueue.player.stop();
	}
	// DONE
	function pause(message, serverQueue) {
		if (!message.member.voice.channel) return message.channel.send(
			"you're not even in a voice channel!! "
		);
		if (isServerQueueNull(message, serverQueue)) return;

		serverQueue.isPlaying = false;
		serverQueue.isPaused = true;
		const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setDescription('okay, paused!!');
		serverQueue.textChannel.send({embeds: [embed]});
		serverQueue.player.pause();
	}

	function unpause(message, serverQueue) {
		if (!message.member.voice.channel) return message.channel.send(
			"you're not even in a voice channel!! "
		);
		if (isServerQueueNull(message, serverQueue)) return;

		serverQueue.isPlaying = true;
		serverQueue.isPaused = false;
		serverQueue.player.unpause();
		const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setDescription('unpaused!!');
		serverQueue.textChannel.send({embeds: [embed]});
	}

	function remove(message, serverQueue) {
		if (isServerQueueNull(message, serverQueue)) return;

		const args = message.content.trim().split(/\s+/);
		if (!(args[0] === (`${prefix[botId]}r`) || args[0] === (`${prefix[botId]}remove`))) return;
		if (args.length < 2) {
			return message.channel.send('remove... nani? .-.');
		}
		 
		let removed = 0;
		if (args[1].includes('-')) {
			// range
			const range = args[1].split('-');
			let strt = null;
			let end = null;
			if (range.length === 2) {
				strt = parseInt(range[0]);
				end = parseInt(range[1]);
			} else {
				return message.channel.send('cant remove that.. invalid range!! :c');
			}
			if (strt && strt !== NaN && strt > 0 && strt < end 
				&& end && end !== NaN && end > strt && end <= serverQueue.songs.length) {
				const index = strt - 1
				removed = end === null ? 1 : end - index;
				if (serverQueue.index+1 >= strt && serverQueue.index+1 <= end) {
					serverQueue.songs.splice(index, removed);
					serverQueue.index = index;
					play(message.guild, serverQueue.songs[index])
				} else {
					serverQueue.songs.splice(index, removed);
				}
			} else {
				return message.channel.send('cant remove that.. invalid input!! :c');
			}
		} else {
			// individual slice
			let index = null;
			if (args[1] === 'now') args[1] = serverQueue.index + 1;
			else if (args[1] === 'last') args[1] = serverQueue.songs.length;
			for (let i = args.length-1 ; i > 0 ; i--) {
				const one = removeOne(args[i], serverQueue);
				if (one) {
					removed++;
					if (index) index--;
					else if (!parseInt(one))  index = serverQueue.index;
				}
			}

			if (index !== null) {
				if (serverQueue.index === serverQueue.songs.length) {
					serverQueue.index = index-1;
					serverQueue.player.stop();
				} else {
					serverQueue.index = index;
					play(message.guild, serverQueue.songs[index]);
				}
			}
		}

		serverQueue.index = serverQueue.index+1 > serverQueue.songs.length 
		? serverQueue.songs.length : serverQueue.index;

		const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setDescription('**'+ removed + ' song(s)** removed from the queue!');
		serverQueue.textChannel.send({embeds: [embed]});
	}

	function removeOne(index, serverQueue){
		index = parseInt(index);
		if (!index) return false;
		index--;
		if (index > -1 && index < serverQueue.songs.length) {
			serverQueue.songs.splice(index, 1);
			if (index === serverQueue.index) return true;
		}
		return index + 1;
	}

	function disconnect(message, serverQueue) {
		serverQueue.connection.destroy();
		serverQueue.connection = null;
	}

	function staticPlay(message, serverQueue) {
		// IF NO QUEUE LIST
		if (!serverQueue) serverQueue = createServerQueue(message, serverQueue);
		
		// IF NO CONNECTION
		if (!serverQueue.connection) {
			const connection = VoiceDiscord.joinVoiceChannel({
				channelId: message.member.voice.channelId,
				guildId: message.guild.id,
				adapterCreator: message.guild.voiceAdapterCreator,
			});
			connection.subscribe(serverQueue.player);
			serverQueue.connection = connection;
		}

		// IF PAUSED
		if(serverQueue.isPaused) {
			unpause(message, serverQueue);
			return;
		}

		// IF NOTHINGS PLAYING AND THERES AT LEAST ONE SONG, PLAY THE QUEUE
		if (!serverQueue.isPlaying && serverQueue.songs.length > 0) {
			serverQueue.isStopped = false;
			if (serverQueue.isShuffled) {
				if (serverQueue.shuffleIndex >= serverQueue.songs.length) {
					shuffle(null, serverQueue);
				}
				play(message.guild, serverQueue.songs[serverQueue.shuffled[serverQueue.shuffleIndex]]);
			} else {
				if (serverQueue.index >= serverQueue.songs.length) {
					serverQueue.index = 0;
				}
				play(message.guild, serverQueue.songs[serverQueue.index]);
			} 
		}
	}

	function bye(message, serverQueue) {
		if (message.content === (`${prefix[botId]}kill`) || message.content === (`${prefix[botId]}die`)) {
			message.channel.send('ok..');
		} else {
			message.channel.send('bye bye!!');
		}
		uselessCounter = 0;
		if (serverQueue) {
			serverQueue.player.stop();
			serverQueue.connection.destroy();
			serverQueue = null;
			queue.delete(message.guildId);
		}
	}

	async function showQueue(message, serverQueue, page, edit){
		if(isServerQueueNull(message, serverQueue)) return;

		if (serverQueue.songs.length === 0) {
			const embed = new Discord.MessageEmbed()
			.setColor('#E9C486')
			.setTitle('queue list!')
			.setDescription('empty :c');
			sendCommandEmbed(embed, serverQueue);
			return;
		}

		let qstr = '';
		let strt = page ? 1+(10*(page-1)) : 1;
		let end = Math.min(strt + 9, serverQueue.songs.length);
		for(strt; strt<=end; strt++) {
			qstr += (strt-1 === serverQueue.index ? '🍡🍡🍡**now playing**🍡🍡🍡\n' : '') 
			+ '> ' + strt + '. '
			+ '<@' + serverQueue.songs[strt-1].by + '>'
			+ '`[' + serverQueue.songs[strt-1].duration + ']`'
			+ '['+serverQueue.songs[strt-1].title+']('+serverQueue.songs[strt-1].url+')'			
			+ (strt-1 === serverQueue.index ? '\n**-------------------------------------**\n' : '\n');
		} 

		const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setTitle('queue list!')
		.setDescription(qstr);

		serverQueue.queueEmbed.page = page ? page : 1;
		const msg = await sendCommandEmbed(embed, serverQueue, edit, 'queue');
		if (msg && serverQueue.songs.length > 10) {
			await msg.react('◀️');
			await msg.react('▶️');
			serverQueue.queueEmbed.msg = msg;
		}
	}

	async function navigateQueue(message, serverQueue) {
		if(isServerQueueNull(message, serverQueue)) return;

		let args = (
			message.content.startsWith(`${prefix[botId]}queue`) ?
			message.content.replace((`${prefix[botId]}queue`), '') :
			message.content.replace((`${prefix[botId]}q`), '')
		);
		
		if (args.startsWith('-s') || args.startsWith('-search')) {
			args = (
				args.startsWith('-search') ?
				args.replace(('-search'), '') :
				args.replace(('-s'), '')
			).trim();

			let songNum = null;
			if (ytdl.validateURL(args)) {
				for (let y=0; y<serverQueue.songs.length; y++) {
					if (serverQueue.songs[y].url === args) {
						songNum = y+1;
						break;
					}
				}
			} else {
				const filter = await ytsr.getFilters(args);
				const filter1 = filter.get('Type').get('Video');
				const result = await ytsr(filter1.url, { limit: 3 });
				const filtr = await ytsr.getFilters(filter1.url);
				const filter2 = await filtr.get('Sort by').get('View count');
				const result2 = await ytsr(filter2.url, { limit: 3 });
				
				for (let y=0; y<serverQueue.songs.length; y++) {
					for (let i=0; i<result.items.length; i++) {
						if ((!result.items[i].isLive
							&& serverQueue.songs[y].url === result.items[i].url)
							|| (!result2.items[i].isLive 
							&& serverQueue.songs[y].url === result2.items[i].url)) {
							songNum = y+1;
							break;
						}
					}
					if (songNum) break;
				}
			}
			
			if (songNum) {
				const page = Math.ceil(songNum/10);
				showQueue(message, serverQueue, page, false);
				const embed = new Discord.MessageEmbed()
				.setColor('#E9C486')
				.setDescription('found it... **song ' + songNum + '**! c:');
				message.channel.send({embeds: [embed]});
			} else {
				serverQueue.textChannel.send('cant find it! try using other keywords... sorry! .v.');
			}
		} else if (args.startsWith('-p') || args.startsWith('-page'))  {
			args = (
				args.startsWith('-page') ?
				args.replace(('-page'), '') :
				args.replace(('-p'), '')
			).trim();

			if(parseInt(args)) {
				const maxPages = Math.ceil(serverQueue.songs.length/10);
				const page = parseInt(args) > 0 ? Math.min(parseInt(args), maxPages) : 1;
				showQueue(message, serverQueue, page, false);
			}
		} else if (args.startsWith('-j') || args.startsWith('-jump'))  {
			args = (
				args.startsWith('-jump') ?
				args.replace(('-jump'), '') :
				args.replace(('-j'), '')
			).trim();

			if(parseInt(args)) {
				const maxSong = serverQueue.songs.length;
				const maxPages = Math.ceil(serverQueue.songs.length/10);
				const pageInt = parseInt(args) > 0 ? Math.min(Math.ceil(parseInt(args)/10), maxSong) : 1;
				const page = Math.min(pageInt, maxPages);
				showQueue(message, serverQueue, page, false);
			}
		}
	}

	function clearQueue(message, serverQueue) {
		if(isServerQueueNull(message, serverQueue)) return;

		serverQueue.songs = [];
		serverQueue.shuffled = [];
		serverQueue.index = 0;
		serverQueue.shuffleIndex = 0;
		serverQueue.player.stop();
		serverQueue.isPlaying = false;
		serverQueue.isPaused = false;

		const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setDescription('queue list cleared!');
		return message.channel.send({embeds: [embed]});
	}

	function nowPlaying(message, serverQueue) {
		if(isServerQueueNull(message, serverQueue)) return;

		const embed = new Discord.MessageEmbed();
		if (serverQueue.index < serverQueue.songs.length) {
			embed.setColor('#E9C486')
			.setTitle('now playing!')
			.setDescription('['+serverQueue.songs[serverQueue.index].title+']'
				+'('+serverQueue.songs[serverQueue.index].url+')'
				+' `['+serverQueue.songs[serverQueue.index].duration+']`'
				+' <@'+serverQueue.songs[serverQueue.index].by+'>'
			);
		} else if (serverQueue.isStopped) {
			embed.setColor('#E9C486')
			.setDescription('no current song is playing... :c');
		}
		sendCommandEmbed(embed, serverQueue, true, 'playing');
	}

	function help(message) {
		let cstr = '';
		const embed = new Discord.MessageEmbed();
		if (message.content === (`${prefix[botId]}help`)) {
			const {
				names,
				commands,
			} = require('./helpcommand.json');
			let length = names.length;
			for (let i=0; i<length; i++) {
				cstr += '**' + names[i] + ':**\n> '
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
				+'of that command (\'-help loop-one\', \'-help play\')');
			message.channel.send({embeds: [embed]});
		} else if (message.content.startsWith(`${prefix[botId]}help `)) {
			const arg = message.content.replace((`${prefix[botId]}help `),'').trim();
			const {
				names,
				definitions,
			} = require('./helpcommand.json');

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
		delete require.cache[require.resolve('./helpcommand.json')]
		// 👍
	}

	async function play(guild, song) {
		const serverQueue = queue.get(guild.id);
		if (!song) {
			console.log("apparently, no song...");
			serverQueue.player.stop();
			return;
		}

		const stream = await ytdl(
			song.url, 
			{
				filter: 'audioonly', 
				quality: 'highestaudio', 
				highWaterMark: 1<<25
			}
		);

		const resource = VoiceDiscord.createAudioResource(stream, { inputType: VoiceDiscord.StreamType.Arbitrary });

		serverQueue.isPlaying = true;
		serverQueue.isStopped = false;
		serverQueue.player.play(resource);
		song.backup = [];

		const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setTitle('now playing!')
		.setDescription('['+song.title+']('+song.url+') `['+ song.duration +']`' 
			+ '<@' + song.by + '>');
		sendCommandEmbed(embed, serverQueue, true, 'playing');
		console.log(`[${song.title}] now playing!`);
	}

	async function sendCommandEmbed(embed, serverQueue, edit, message) {
		if (!serverQueue) return null;

		embed.setFooter( (serverQueue.songs.length + ' song(s); ')
			+ (serverQueue.isPaused ? 'paused; ' : '')
			+ (serverQueue.isShuffled ? 'shuffle is on; ' : '')
			+ (serverQueue.loopOne ? 'one song on loop; ' : (serverQueue.loopAll ? 'queue on loop; ' : ''))
		);

		if (edit) {
			if (message === 'playing') {
				if (serverQueue.playingEmbed.msg) {
					if (serverQueue.playingEmbed.msg.id === recentMessage.id) {
						recentMessage.edit({embeds: [embed]});
						return;
					}
				} 
				serverQueue.playingEmbed.msg = await serverQueue.textChannel.send({embeds: [embed]});
			} else {
				if (serverQueue.queueEmbed.msg) {
					serverQueue.queueEmbed.msg.edit({embeds: [embed]});
				}
			}
		} else {
			return serverQueue.textChannel.send({embeds: [embed]});
		}
	}

	function isServerQueueNull(message, serverQueue) {
		if(!serverQueue) {
			const embed = new Discord.MessageEmbed()
			.setColor('#E9C486')
			.setTitle('queue list!')
			.setDescription('empty :c');
			message.channel.send({embeds: [embed]});
			return true;
		}
		return false;
	}

	client.login(process.env.BOT_TOKENS.split(';')[botId]);
}