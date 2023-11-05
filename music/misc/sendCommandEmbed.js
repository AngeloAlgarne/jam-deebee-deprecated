const Discord = require('discord.js');
const DisTube = require('distube');

const sendCommandEmbed = async (title, content, serverQueue, edit, playOrQueueMsg, from) => {
	const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setTitle(title)
		.setDescription(content)
		.setFooter((from === 'playing' ? '' : (serverQueue.songs.length + ' song(s) in queue; '))
			+ (serverQueue.loopOne ? 'one song on loop; ' : (serverQueue.loopAll ? 'queue on loop; ' : ''))
		);

	if (edit) {
		if (from === 'playing') {
			if (playOrQueueMsg.playMessage) {
				if (playOrQueueMsg.playMessage.id === playOrQueueMsg.recentMessage.id) {
					playOrQueueMsg.recentMessage.edit({embeds: [embed]});
					return;
				}
			} 
			playOrQueueMsg.playMessage = await serverQueue.textChannel.send({embeds: [embed]});
		} else {
			if (playOrQueueMsg.queueEmbed.msg) {
				playOrQueueMsg.queueEmbed.msg.edit({embeds: [embed]});
			}
		}
	} else {
		return serverQueue.textChannel.send({embeds: [embed]});
	}
};

module.exports = { sendCommandEmbed };