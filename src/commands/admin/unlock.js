const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Déverrouille un canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
            SendMessages: null
        });

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('🔓 Canal Déverrouillé')
            .setDescription(`Ce canal a été déverrouillé par ${interaction.user}.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
