const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Verrouille un canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison du verrouillage')
                .setRequired(false)),

    async execute(interaction) {
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';

        await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
            SendMessages: false
        });

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🔒 Canal Verrouillé')
            .setDescription(`Ce canal a été verrouillé par ${interaction.user}.`)
            .addFields({ name: 'Raison', value: reason })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
