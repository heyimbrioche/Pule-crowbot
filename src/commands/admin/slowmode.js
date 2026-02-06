const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Définit le mode lent du canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addIntegerOption(option =>
            option.setName('secondes')
                .setDescription('Durée du slowmode en secondes (0 pour désactiver)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600)),

    async execute(interaction) {
        const seconds = interaction.options.getInteger('secondes');

        await interaction.channel.setRateLimitPerUser(seconds);

        const embed = new EmbedBuilder()
            .setColor(seconds > 0 ? '#FEE75C' : '#57F287')
            .setDescription(
                seconds > 0
                    ? `⏱️ Mode lent défini à **${seconds}** seconde(s).`
                    : '✅ Mode lent désactivé.'
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
