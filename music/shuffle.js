const DisTube = require('distube');
const { isServerQueueNull } = require('./misc/isServerQueueNull');
const { sendSimpleEmbed } = require('./misc/sendSimpleEmbed');

module.exports = {
	name: 'shuffle',
	run : (data) => {
		const serverQueue = data.queue.get(data.message);
			
		if(!data.replaceArray) {
			if (isServerQueueNull(data.message, serverQueue)) return;

			serverQueue.isShuffled = !serverQueue.isShuffled;
			const content = ('**shuffle** is now **' 
				+ (serverQueue.isShuffled ? 'on' : 'off') +'**!');
			sendSimpleEmbed(data.message, content);
		}
		if (serverQueue.isShuffled) {
			// Fisher-Yates (aka Knuth) Shuffle
			const array = [];
			for(let i=0; i<serverQueue.songs.length;i++) array.push(i);
			let currentIndex = array.length,  randomIndex;
			while (currentIndex != 0) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;
				[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
			}
			serverQueue.shuffled = array;
			serverQueue.shuffleIndex = 0;
		}
	}
}