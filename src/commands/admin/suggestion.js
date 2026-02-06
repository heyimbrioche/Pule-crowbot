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
        .setName('suggestion-setup')
        .setDescription('Configure le système de suggestions')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Le salon où les suggestions seront envoyées')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('Couleur de l\'embed (hex, ex: #FEE75C)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('emoji-oui')
                .setDescription('Emoji pour voter oui (défaut: ✅)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('emoji-non')
                .setDescription('Emoji pour voter non (défaut: ❌)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('thread')
                .setDescription('Créer un fil de discussion automatiquement ? (défaut: oui)')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const color = (interaction.options.getString('couleur') || '#FEE75C').replace(/\s/g, '');
        const emojiYes = interaction.options.getString('emoji-oui') || '✅';
        const emojiNo = interaction.options.getString('emoji-non') || '❌';
        const thread = interaction.options.getBoolean('thread') ?? true;

        await db.set(`suggestions_${interaction.guild.id}`, {
            channelId: channel.id,
            color: color,
            emojiYes: emojiYes,
            emojiNo: emojiNo,
            thread: thread,
            enabled: true,
            count: (await db.get(`suggestions_${interaction.guild.id}`))?.count || 0
        });

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Système de Suggestions Configuré')
            .addFields(
                { name: '📢 Salon', value: channel.toString(), inline: true },
                { name: '🎨 Couleur', value: color, inline: true },
                { name: '💬 Thread', value: thread ? 'Oui' : 'Non', inline: true },
                { name: '👍 Emoji Oui', value: emojiYes, inline: true },
                { name: '👎 Emoji Non', value: emojiNo, inline: true }
            )
            .setFooter({ text: 'Les messages envoyés dans ce salon seront transformés en suggestions.' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
