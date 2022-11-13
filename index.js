// discord.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// express
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

// rate limiter
const slowDown = require("express-slow-down");

app.enable("trust proxy");

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5,
  delayMs: 10000
});

//  apply to all requests
app.use(speedLimiter);

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, c => {
	console.log('Swiftah is now active');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

app.use(express.json());

// verify backend is functional
app.get("/", (req, res) => {
    res.send("Backend is functional")
})

app.post('/contact', (req, res) => {
	const name = req.body.name;
	const email = req.body.email;
	const phone = req.body.phone;
	const message = req.body.message;

	client.channels.cache.get(process.env.CONTACT_CHANNEL_ID).send(
		`New Contact Request!\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}\n\n<@${process.env.PERSONAL_ID}>`
		);
	res.json(req.body);
});

app.listen(process.env.PORT || 80, () => {
	console.log(`Listening on port ${process.env.PORT}`)
});

client.login(process.env.TOKEN);