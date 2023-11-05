const editJsonFile = require('edit-json-file');
const commandsFile = editJsonFile('./music/json/commands.json', {autosave: true});

// ----------------------------------------------------------------------
const setUpCommandDictionary = () => {
	const commandData = commandsFile.toObject();
	commandData.names.forEach(cmd => {
		commandData.commandCode[cmd].forEach(alias => {
			commandsFile.set('commandDict.'+alias, cmd);
		});
	});
}

const addCommandAlias = (message, args) => {
	// name
	// alias(es)
	// description for "help"
	// require('json/help.json')
	// delete require('json/help.json')
	
	message.channel.send('not ready yet, sorry!');
}

module.exports = { setUpCommandDictionary, addCommandAlias };