const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType, 
    EmbedBuilder, 
    MessageFlags 
} = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bug-setup')
        .setDescription('Configure le système de rapport de bugs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Le salon où les bugs seront envoyés')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('Couleur de l\'embed (hex, ex: #ED4245)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('thread')
                .setDescription('Créer un fil de discussion automatiquement ? (défaut: oui)')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const color = (interaction.options.getString('couleur') || '#ED4245').replace(/\s/g, '');
        const thread = interaction.options.getBoolean('thread') ?? true;

        await db.set(`bugs_${interaction.guild.id}`, {
            channelId: channel.id,
            color: color,
            thread: thread,
            enabled: true,
            count: (await db.get(`bugs_${interaction.guild.id}`))?.count || 0
        });

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Système de Bugs Configuré')
            .addFields(
                { name: '📢 Salon', value: channel.toString(), inline: true },
                { name: '🎨 Couleur', value: color, inline: true },
                { name: '💬 Thread', value: thread ? 'Oui' : 'Non', inline: true }
            )
            .setFooter({ text: 'Les messages envoyés dans ce salon seront transformés en rapports de bugs.' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
