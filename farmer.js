import { promises as fs } from 'fs';
import { Client } from 'discord.js-selfbot';

const client = new Client();

async function connect(channelId) {
	const token = (await fs.readFile('token', 'utf8'));

	client.on('ready', async () => {
		console.debug('Client ready!');
		const channel = client.channels.cache.get("");
		await channel.join(channelId);
		console.debug(`Joined ${channel.name}@${channel.guild.name}!`);
	});

	client.login(token);
}

connect('712645175670865951');
