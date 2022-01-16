import { promises as fs } from 'fs';
import Discord from 'discord.js-selfbot';

const client = new Discord.Client();

async function connect(channelId) {
	const token = (await fs.readFile('token', 'utf8'));

	client.on('ready', async () => {
		console.debug('Client ready!');
		const channel = await client.channels.fetch(channelId);
		await channel.join();
		console.debug(`Joined ${channel.name}@${channel.guild.name}!`);
	});

	client.login(token);
}

connect('712645175670865951');
