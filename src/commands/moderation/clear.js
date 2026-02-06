const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime des messages dans le canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de messages à supprimer (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Supprimer uniquement les messages de cet utilisateur')
                .setRequired(false)),

    async execute(interaction) {
        const amount = interaction.options.getInteger('nombre');
        const user = interaction.options.getUser('utilisateur');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            let messages = await interaction.channel.messages.fetch({ limit: 100 });

            if (user) {
                messages = messages.filter(m => m.author.id === user.id);
            }

            // Filtrer les messages de moins de 14 jours
            const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
            messages = messages.filter(m => m.createdTimestamp > twoWeeksAgo);

            const toDelete = messages.first(amount);
            const deleted = await interaction.channel.bulkDelete(toDelete, true);

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`🗑️ **${deleted.size}** message(s) supprimé(s)${user ? ` de ${user}` : ''}.`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            await interaction.editReply({
                content: '❌ Erreur lors de la suppression des messages.'
            });
        }
    }
};
