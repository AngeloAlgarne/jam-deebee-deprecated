const DisTube = require('distube');
const { createServerQueue } = require('./misc/createServerQueue');
const { sendSimpleEmbed } = require('./misc/sendSimpleEmbed');

module.exports = {
	name: 'play',
	run : async (data) => {
		// PROCESS INPUT
		const args = data.args.split(/[\n,]+/);

		// VALIDATION
		const voiceChannel = data.message.member.voice.channel;
		if (!voiceChannel) return data.message.channel.send(
			"join a voice channel first!"
		);
		const permissions = voiceChannel.permissionsFor(data.message.client.user);
		if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
			return data.message.channel.send(
				"i need the permissions to join and speak in your voice channel!"
			);
		}
		if (data.args.length === 0) {
			return data.message.channel.send('play nani??');
		}

		// CHECK SERVER QUEUE
		let serverQueue = data.queue.get(data.message.channel.guildId);
		if (!serverQueue) { // if no server queue, create one
			serverQueue = createServerQueue(data.message);
			data.queue.set(data.message.channel.guildId, serverQueue);
		}

		// PROCESS URLs
		for (let i=0; i<args.length; i++) {
			try {
				await data.distube.play(data.message, args[i]);
			} catch (err) {
				console.error(err);
			}
		}


		const songs = data.distube.getQueue(data.message).songs;
		songs.forEach(item => {
			const song = {
				title: item.name.trim(),
				url: item.url.trim(),
				duration: item.formattedDuration.trim(),
				by: item.user.id,
				message: data.message,
			}
			serverQueue.songs.push(song);
		});

		let content = songs.length > 1 ?
		'**'+ songs.length + ' songs** added to queue list!' : 
		'**'+ songs[songs.length-1].name
				+ '** added to queue list!';
		sendSimpleEmbed(data.message, content);
	}
}