import { promises as fs } from 'fs';
import Discord from 'discord.js-selfbot';

const { Client, Intents } = Discord;

// Timings in milliseconds
const RECONNECT_COOLDOWN = 30 * 1000;
const REFRESH_INTERVAL = 30 * 60 * 1000;

var cacheDir;

if (process.platform === 'linux') {
	const cacheHome = process.env.XDG_CACHE_HOME || `${process.env.HOME}/.cache`;
	cacheDir = `${cacheHome}/mana`;
} else if (process.platform === 'darwin') {
	const cacheHome = `${process.env.HOME}/Library/Caches`;
	cacheDir = `${cacheHome}/fr.42lyon.chamada.mana`;
} else {
	console.error(`Unknown system: '${process.platform}'!`);
	process.exit(1);
}

process.on('uncaughtException', function (err) {
	console.log('Caught exception: ', err);
});

const client = new Client({
	intents: [Intents.FLAGS.DIRECT_MESSAGES],
	partials: ['MESSAGE', 'CHANNEL'],
});

function storeMana(manaMessage) {
	if (manaMessage.channel.type === 'dm' && manaMessage.author.username === 'Neko') {
		for (const embed of manaMessage.embeds) {
			const total = embed.fields.find((field) => field.name === 'Total');
			if (total !== undefined) {
				console.debug('Total:', total.value);
				fs.writeFile(`${cacheDir}/total`, total.value, { encoding: 'utf-8', mode: 0o600 });
			}
		}
	}
}

async function connectVoice(channel) {
	console.debug(`Joining ${channel.name}@${channel.guild.name}...`);
	const connection = await channel.join();

	console.debug('Connected!');
	connection.once('disconnect', () => {
		console.debug('Disconnected from voice channel!');

		setTimeout(() => {
			console.debug('Reconnecting...');
			connectVoice(channel);	
		}, RECONNECT_COOLDOWN);
	});
}

async function farm(channelId, manaChannelId) {
	const token = (await fs.readFile(`${cacheDir}/token`, 'ascii'));

	client.on('message', storeMana);

	client.once('ready', async () => {
		console.debug('Ready!');

		const channel = await client.channels.fetch(channelId);

		connectVoice(channel);

		const manaChannel = await client.channels.fetch(manaChannelId);

		manaChannel.send('!mana');
		setInterval(() => manaChannel.send('!mana'), REFRESH_INTERVAL);
	});

	client.login(token);
}

farm('712645175670865951', '710872410198376478');
