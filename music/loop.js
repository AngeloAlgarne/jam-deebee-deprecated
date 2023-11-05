const DisTube = require('distube');
const { isServerQueueNull } = require('./misc/isServerQueueNull');
const { sendSimpleEmbed } = require('./misc/sendSimpleEmbed');

module.exports = {
	name: 'loop',
	run : (data) => {
		const serverQueue = data.queue.get(data.message.guildId);
		if(isServerQueueNull(data.message, serverQueue)) return;

		// loop queue
		const initVal = serverQueue.loopOne;
		serverQueue.loopAll = serverQueue.loopAll ? false : true;
		serverQueue.loopOne = serverQueue.loopAll ? false : serverQueue.loopOne;

		const content = ('\"looping queue\" has been turned **' 
			+ (serverQueue.loopAll ? 'on' : 'off') +'**!'
			+ (initVal ? '\nno longer looping one song c:' : ''));
		sendSimpleEmbed(data.message, content);
	}
}