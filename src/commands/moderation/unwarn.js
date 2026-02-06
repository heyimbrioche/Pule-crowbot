const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Retire un avertissement')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre concerné')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('warn-id')
                .setDescription('ID de l\'avertissement à retirer (ou "all" pour tout supprimer)')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('membre');
        const warnId = interaction.options.getString('warn-id');

        let warns = await db.get(`warns_${interaction.guild.id}_${user.id}`) || [];

        if (warns.length === 0) {
            return interaction.reply({
                content: `✅ ${user.tag} n'a aucun avertissement.`,
                flags: MessageFlags.Ephemeral
            });
        }

        if (warnId.toLowerCase() === 'all') {
            await db.delete(`warns_${interaction.guild.id}_${user.id}`);
            
            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`✅ Tous les avertissements de ${user} ont été supprimés. (${warns.length} warn(s))`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        const warnIndex = warns.findIndex(w => w.id === warnId);
        if (warnIndex === -1) {
            return interaction.reply({
                content: '❌ Avertissement non trouvé. Vérifiez l\'ID.',
                flags: MessageFlags.Ephemeral
            });
        }

        const removedWarn = warns.splice(warnIndex, 1)[0];
        await db.set(`warns_${interaction.guild.id}_${user.id}`, warns);

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Avertissement Retiré')
            .addFields(
                { name: 'Membre', value: user.tag, inline: true },
                { name: 'Warns restants', value: warns.length.toString(), inline: true },
                { name: 'Raison du warn retiré', value: removedWarn.reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
