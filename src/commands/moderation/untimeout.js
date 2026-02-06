const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Retire le timeout d\'un membre')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à untimeout')
                .setRequired(true)),

    async execute(interaction) {
        const member = interaction.options.getMember('membre');

        if (!member) {
            return interaction.reply({
                content: '❌ Ce membre n\'est pas sur le serveur.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (!member.isCommunicationDisabled()) {
            return interaction.reply({
                content: '❌ Ce membre n\'est pas en timeout.',
                flags: MessageFlags.Ephemeral
            });
        }

        await member.timeout(null);

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Timeout Retiré')
            .addFields(
                { name: 'Membre', value: member.user.tag, inline: true },
                { name: 'Modérateur', value: interaction.user.toString(), inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
