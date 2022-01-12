const Discord = require('discord.js-selfbot');
const client = new Discord.Client();
const fs = require('fs').promises;

const channelId = '712645175670865951';

async function connect() {
	const token = (await fs.readFile('token', 'utf8')).replace('\n', '');
	client.login(token);
}

client.on('ready', async () => {
    console.debug('Client ready!');
	const channel = client.channels.cache.get("");
	await channel.join(channelId);
	console.debug(`Joined ${channel.name}@${channel.guild.name}!`);
});

connect();
