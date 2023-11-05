const DisTube = require('distube');
const { isServerQueueNull } = require('./misc/isServerQueueNull');

module.exports = {
	name: 'skip',
	run : (data) => {
		const serverQueue = data.queue.get(data.message.guildId);
		if (isServerQueueNull(data.message, serverQueue)) return;


	}
}