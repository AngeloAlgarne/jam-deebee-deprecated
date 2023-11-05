const DisTube = require('distube');
const { isServerQueueNull } = require('./misc/isServerQueueNull');
const { sendSimpleEmbed } = require('./misc/sendSimpleEmbed');

module.exports = {
	name: 'clear',
	run : (data) => {
		if (isServerQueueNull(data.message, data.serverQueue)) return;

		data.serverQueue.songs = [];
		data.serverQueue.shuffled = [];
		data.serverQueue.index = 0;
		data.serverQueue.shuffleIndex = 0;
		data.distube.skip();
		
		sendSimpleEmbed(data.message, 'queue list cleared!');
	}
}
