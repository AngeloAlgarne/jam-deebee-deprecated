const DisTube = require('distube');

module.exports = {
	name: 'repeat',
	run : (data) => {
		data.distube.stop(data.message);
		const serverQueue = data.queue.get(data.message.guildId);
		if(!serverQueue) return;
		const timer = ms => new Promise( res => setTimeout(res, ms));
		timer(500)
		.then(_=>
			distube.play(data.message, serverQueue.songs[serverQueue.index].url)
		);
	}
}