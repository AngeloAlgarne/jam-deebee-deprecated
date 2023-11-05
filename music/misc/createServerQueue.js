
const createServerQueue = (message) => {
	return {
		voiceChannel: message.member.voice.channel,
		textChannel: message.channel,
		songs: [],
		index: 0,
		volume: 5,
		isPlaying: false,
		isPaused: false,
		isStopped: false,
		isShuffled: false,
		shuffled: [],
		shuffleIndex: 0,
		loopAll: false,
		loopOne: false,
	};
}

module.exports = { createServerQueue };

