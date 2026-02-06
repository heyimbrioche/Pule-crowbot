const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Fait parler le bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à envoyer')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Le canal où envoyer le message')
                .setRequired(false)),

    async execute(interaction) {
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.send(message);
            await interaction.reply({ 
                content: `✅ Message envoyé dans ${channel} !`, 
                flags: MessageFlags.Ephemeral 
            });
        } catch (error) {
            await interaction.reply({
                content: '❌ Je ne peux pas envoyer de message dans ce canal.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
