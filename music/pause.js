const DisTube = require('distube');
const { isServerQueueNull } = require('./misc/isServerQueueNull');
const { sendSimpleEmbed } = require('./misc/sendSimpleEmbed');

module.exports = {
	name: 'pause',
	run : (data) => {
		const serverQueue = data.queue.get(data.message.channel.guildId);
		if (isServerQueueNull(data.message, serverQueue)) return;

		serverQueue.isPlaying = false;
		serverQueue.isStopped = true;

		data.distube.stop(data.message);
		data.distube.getQueue(q.textChannel).songs = [];

		sendSimpleEmbed(data.message, 'stopped playing!');
	}
}