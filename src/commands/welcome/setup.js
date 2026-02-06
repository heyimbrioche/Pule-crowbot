const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-setup')
        .setDescription('Configure les messages de bienvenue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal pour les messages de bienvenue')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message de bienvenue ({user}, {username}, {server}, {memberCount})')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('auto-role')
                .setDescription('Rôle à attribuer automatiquement')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('Couleur de l\'embed (hex, ex: #5865F2)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('banner')
                .setDescription('URL de l\'image/banner de bienvenue')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const rawMessage = interaction.options.getString('message') || 'Bienvenue {user} sur **{server}** ! 🎉\\nTu es notre **{memberCount}ème** membre !';
        const message = rawMessage.replace(/\\n/g, '\n');
        const autoRole = interaction.options.getRole('auto-role');
        const color = interaction.options.getString('couleur') || '#5865F2';
        const banner = interaction.options.getString('banner');

        const existingConfig = await db.get(`welcome_${interaction.guild.id}`) || {};

        await db.set(`welcome_${interaction.guild.id}`, {
            ...existingConfig,
            enabled: true,
            channelId: channel.id,
            message: message,
            autoRoleId: autoRole?.id || existingConfig.autoRoleId || null,
            color: color,
            bannerUrl: banner || existingConfig.bannerUrl || null
        });

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Messages de Bienvenue Configurés')
            .addFields(
                { name: '📢 Canal', value: channel.toString(), inline: true },
                { name: '🎭 Auto-Rôle', value: autoRole?.toString() || 'Aucun', inline: true },
                { name: '🎨 Couleur', value: color, inline: true }
            )
            .addFields(
                { name: '💬 Message', value: message.substring(0, 1024) }
            )
            .setFooter({ text: 'Variables: {user}, {username}, {server}, {memberCount}' })
            .setTimestamp();

        if (banner) {
            embed.setImage(banner);
        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
