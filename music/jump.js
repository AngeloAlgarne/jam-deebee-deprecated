const DisTube = require('distube');
const { isServerQueueNull } = require('./misc/isServerQueueNull');

module.exports = {
	name: 'jump',
	run : (data) => {
		const serverQueue = data.queue.get(data.message.guildId);
		if (isServerQueueNull(data.message, serverQueue)) return;
		let index = parseInt(args[0]);
		if (args[0] === 'last') index = serverQueue.songs.length;
		else if (args[0] === 'now') index = serverQueue.index + 1;
		if (!index) return message.channel.send("cant jump there... invalid input! :<");
		index--;

		serverQueue.index = index;
		data.distube.play(message.guild, serverQueue.songs[index]);
	}
}