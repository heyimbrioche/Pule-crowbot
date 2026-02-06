const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Configure le système de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('categorie')
                .setDescription('Catégorie où les tickets seront créés')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory))
        .addRoleOption(option =>
            option.setName('role-support')
                .setDescription('Rôle du staff qui gère les tickets')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('logs')
                .setDescription('Canal pour les logs des tickets')
                .addChannelTypes(ChannelType.GuildText))
        .addIntegerOption(option =>
            option.setName('max-tickets')
                .setDescription('Nombre maximum de tickets par utilisateur (défaut: 3)')
                .setMinValue(1)
                .setMaxValue(10)),

    async execute(interaction) {
        const category = interaction.options.getChannel('categorie');
        const supportRole = interaction.options.getRole('role-support');
        const logChannel = interaction.options.getChannel('logs');
        const maxTickets = interaction.options.getInteger('max-tickets') || 3;

        await db.set(`tickets_${interaction.guild.id}`, {
            categoryId: category.id,
            supportRoleId: supportRole.id,
            logChannelId: logChannel?.id || null,
            maxTickets: maxTickets,
            enabled: true
        });

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Système de Tickets Configuré')
            .addFields(
                { name: '📁 Catégorie', value: category.name, inline: true },
                { name: '👥 Rôle Support', value: supportRole.toString(), inline: true },
                { name: '📝 Logs', value: logChannel?.toString() || 'Non configuré', inline: true },
                { name: '🔢 Max Tickets', value: maxTickets.toString(), inline: true }
            )
            .setFooter({ text: 'Utilisez /ticket-panel pour créer le panneau de tickets' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
