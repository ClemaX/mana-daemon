import { promises as fs } from 'fs';
import Discord from 'discord.js-selfbot';

const { Client, Intents } = Discord;

// Timings in milliseconds
const RECONNECT_COOLDOWN = 30 * 1000;
const REFRESH_INTERVAL = 30 * 60 * 1000;

const MANA_CHANNEL_NAME = 'what-is-my-mana';
const MANA_BOT_NAME = 'Neko';
const MANA_CMD = '!mana';

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
	if (manaMessage.channel.type === 'text'
	&& manaMessage.author.id === client.user.id
	&& manaMessage.channel.name === MANA_CHANNEL_NAME
	&& manaMessage.content === MANA_CMD) {
		manaMessage.delete();
	}
	else if (manaMessage.channel.type === 'dm'
	&& manaMessage.author.username === MANA_BOT_NAME) {
		for (const embed of manaMessage.embeds) {
			const total = embed.fields.find((field) => field.name === 'Total');
			if (total !== undefined) {
				console.debug('Total:', total.value);
				fs.writeFile(`${cacheDir}/total`, total.value, { encoding: 'utf-8', mode: 0o600 });
			}
		}
	}
}

/*
async function cleanupHistory(channel) {
	const messages = (await channel.messages.fetch())
		.filter(message => message.author.id === client.user.id && message.content === MANA_CMD);

	messages.forEach(message => message.delete());
}
*/

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
	const token = await fs.readFile(`${cacheDir}/token`, 'ascii');

	client.on('message', storeMana);

	client.once('ready', async () => {
		console.debug('Ready!');

		const channel = await client.channels.fetch(channelId);

		connectVoice(channel);

		const manaChannel = await client.channels.fetch(manaChannelId);

		// cleanupHistory(manaChannel);

		manaChannel.send(MANA_CMD);
		setInterval(() => manaChannel.send(MANA_CMD), REFRESH_INTERVAL);
	});

	client.login(token);
}

farm('712645175670865951', '710872410198376478');
