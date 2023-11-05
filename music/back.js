const DisTube = require('distube');
const { isServerQueueNull } = require('./misc/isServerQueueNull');

module.exports = {
	name: 'back',
	run : (data) => {
		const serverQueue = data.queue.get(data.message.guildId);
		if (isServerQueueNull(data.message, serverQueue)) return;

		let temp = null;
		if(!serverQueue.isShuffled) {
			temp = serverQueue.index - 1;
			if(temp < 0) return;
		} else {
			temp = serverQueue.shuffleIndex - 1;
			if(temp < 0) return;
			serverQueue.shuffleIndex = temp
			temp = serverQueue.shuffled[serverQueue.shuffleIndex];
		}
		serverQueue.index = temp;
		data.distube.play(data.message, serverQueue.songs[serverQueue.index].url);
	}
}
