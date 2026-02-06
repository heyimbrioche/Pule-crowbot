const { EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // Ignorer les bots
        if (message.author.bot) return;
        if (!message.guild) return;

        // Vérifier si c'est le salon de suggestions
        const suggestConfig = await db.get(`suggestions_${message.guild.id}`);
        if (suggestConfig?.enabled && message.channel.id === suggestConfig.channelId) {
            return handleSuggestion(message, suggestConfig);
        }

        // Vérifier si c'est le salon de bugs
        const bugConfig = await db.get(`bugs_${message.guild.id}`);
        if (bugConfig?.enabled && message.channel.id === bugConfig.channelId) {
            return handleBug(message, bugConfig);
        }
    }
};

async function handleSuggestion(message, config) {
    const content = message.content;
    const attachment = message.attachments.first();

    await message.delete().catch(() => {});
    if (!content && !attachment) return;

    const count = (config.count || 0) + 1;
    config.count = count;
    await db.set(`suggestions_${message.guild.id}`, config);

    const embed = new EmbedBuilder()
        .setColor((config.color || '#FEE75C').replace(/\s/g, ''))
        .setTitle(`💡 Suggestion de ${message.author.username} ✔`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
        .setFooter({ 
            text: `${message.guild.name} © ${new Date().getFullYear()} • ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            iconURL: message.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

    if (content) embed.setDescription(`*${content}*`);
    if (attachment?.contentType?.startsWith('image/')) embed.setImage(attachment.url);

    const msg = await message.channel.send({ embeds: [embed] });

    await msg.react(config.emojiYes || '✅').catch(() => {});
    await msg.react(config.emojiNo || '❌').catch(() => {});

    if (config.thread !== false) {
        try {
            await msg.startThread({
                name: `Suggestion de ${message.author.username} ✔`,
                autoArchiveDuration: 1440
            });
        } catch (error) {
            console.error('Erreur création thread suggestion:', error);
        }
    }

    await db.set(`suggestion_${msg.id}`, {
        authorId: message.author.id,
        content: content,
        image: attachment?.url || null,
        number: count,
        createdAt: Date.now()
    });
}

async function handleBug(message, config) {
    const content = message.content;
    const attachment = message.attachments.first();

    await message.delete().catch(() => {});
    if (!content && !attachment) return;

    const count = (config.count || 0) + 1;
    config.count = count;
    await db.set(`bugs_${message.guild.id}`, config);

    const embed = new EmbedBuilder()
        .setColor((config.color || '#ED4245').replace(/\s/g, ''))
        .setTitle(`🐛 Bug reporté par ${message.author.username}`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            { name: '📝 Description', value: content || 'Aucune description' },
            { name: '🔢 Bug #', value: `${count}`, inline: true },
            { name: '📌 Statut', value: '🟡 En attente', inline: true }
        )
        .setFooter({ 
            text: `${message.guild.name} © ${new Date().getFullYear()} • ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            iconURL: message.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

    if (attachment?.contentType?.startsWith('image/')) embed.setImage(attachment.url);

    // Boutons de statut (admin uniquement)
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`bug_accept_${Date.now()}`)
            .setLabel('Accepté')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅'),
        new ButtonBuilder()
            .setCustomId(`bug_fix_${Date.now()}`)
            .setLabel('En cours de fix')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔧'),
        new ButtonBuilder()
            .setCustomId(`bug_reject_${Date.now()}`)
            .setLabel('Rejeté')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌')
    );

    const msg = await message.channel.send({ embeds: [embed], components: [buttons] });

    if (config.thread !== false) {
        try {
            await msg.startThread({
                name: `Bug #${count} - ${message.author.username}`,
                autoArchiveDuration: 1440
            });
        } catch (error) {
            console.error('Erreur création thread bug:', error);
        }
    }

    await db.set(`bug_${msg.id}`, {
        authorId: message.author.id,
        content: content,
        image: attachment?.url || null,
        number: count,
        createdAt: Date.now(),
        status: 'pending'
    });
}
