const DisTube = require('distube');
const { isServerQueueNull } = require('./misc/isServerQueueNull');
const { sendSimpleEmbed } = require('./misc/sendSimpleEmbed');

module.exports = {
	name: 'loop-one',
	run : (data) => {
		const serverQueue = data.queue.get(data.message.guildId);
		if(isServerQueueNull(data.message, serverQueue)) return;

		if (serverQueue.loopOne) {
			serverQueue.loopOne = false;
			data.distube.setRepeatMode(data.message, 0);
		} else { 
			serverQueue.loopOne = true;
			data.distube.setRepeatMode(data.message, 1);
		}

		const content = ('\"looping current song\" has been turned **' 
			+ (serverQueue.loopOne ? 'on' : 'off') +'**!');
		sendSimpleEmbed(data.message, content);
	}
}