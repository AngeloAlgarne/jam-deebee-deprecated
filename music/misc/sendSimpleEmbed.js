const Discord = require('discord.js');
const DisTube = require('distube');

const sendSimpleEmbed = (message, content) => {
		const embed = new Discord.MessageEmbed()
		.setColor('#E9C486')
		.setDescription(content);
		return message.channel.send({embeds: [embed]});
}

module.exports = { sendSimpleEmbed }