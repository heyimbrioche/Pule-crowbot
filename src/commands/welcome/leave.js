const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave-setup')
        .setDescription('Configure les messages de départ')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal pour les messages de départ')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message de départ ({user}, {username}, {server}, {memberCount})')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const rawMessage = interaction.options.getString('message') || '👋 **{username}** a quitté le serveur.\\nNous sommes maintenant **{memberCount}** membres.';
        const message = rawMessage.replace(/\\n/g, '\n');

        const existingConfig = await db.get(`welcome_${interaction.guild.id}`) || {};

        await db.set(`welcome_${interaction.guild.id}`, {
            ...existingConfig,
            leaveEnabled: true,
            leaveChannelId: channel.id,
            leaveMessage: message
        });

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('✅ Messages de Départ Configurés')
            .addFields(
                { name: '📢 Canal', value: channel.toString(), inline: true },
                { name: '💬 Message', value: message.substring(0, 1024) }
            )
            .setFooter({ text: 'Variables: {user}, {username}, {server}, {memberCount}' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
