const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Débannit un utilisateur')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('user-id')
                .setDescription('ID de l\'utilisateur à débannir')
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.options.getString('user-id');

        try {
            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                return interaction.reply({
                    content: '❌ Cet utilisateur n\'est pas banni.',
                    flags: MessageFlags.Ephemeral
                });
            }

            await interaction.guild.members.unban(userId);

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('✅ Utilisateur Débanni')
                .addFields(
                    { name: 'Utilisateur', value: bannedUser.user.tag, inline: true },
                    { name: 'Modérateur', value: interaction.user.toString(), inline: true }
                )
                .setThumbnail(bannedUser.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            await interaction.reply({
                content: '❌ Impossible de débannir cet utilisateur. Vérifiez l\'ID.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
