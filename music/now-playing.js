const Discord = require('discord.js');
const DisTube = require('distube');
const { isServerQueueNull } = require('./misc/isServerQueueNull');
const { sendCommandEmbed } = require('./misc/sendCommandEmbed');
const { sendSimpleEmbed } = require('./misc/sendSimpleEmbed');

module.exports = {
	name: 'now-playing',
	run : (data) => {
		const serverQueue = data.queue.get(data.message.channel.guildId);
		if (isServerQueueNull(data.message, serverQueue)) return;

		const queue = data.distube.getQueue(data.message);
		if (!queue) {
			sendSimpleEmbed(data.message, 'nothing is currently playing!');
		} else {
			const song = queue.songs[0];
			const title = 'now playing!';
			const content = '['+song.name+']('+song.url+') `['+ song.formattedDuration +']`' 
				+ '<@' + song.user.id + '>';
			sendCommandEmbed(title, content, serverQueue, true, data.playOrQueueMsg, 'playing');
		}
	}
}
