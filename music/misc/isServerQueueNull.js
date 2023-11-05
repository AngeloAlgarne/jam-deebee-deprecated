const Discord = require('discord.js');

const isServerQueueNull = (message, serverQueue) => {
	if(!serverQueue) {
		const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setTitle('queue list!')
		.setDescription('empty :c');
		message.channel.send({embeds: [embed]});
		return true;
	}
	return false;
}

module.exports = { isServerQueueNull };