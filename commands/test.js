const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Tests to see if the bot is active'),
    async execute(interaction) {
        await interaction.reply('Swiftah is currently active');
    }
};