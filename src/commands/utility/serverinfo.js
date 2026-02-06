const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Affiche les informations du serveur'),

    async execute(interaction) {
        const guild = interaction.guild;
        await guild.members.fetch();

        const verificationLevels = {
            0: 'Aucune',
            1: 'Faible',
            2: 'Moyenne',
            3: 'Haute',
            4: 'Très haute'
        };

        const boostLevels = {
            0: 'Niveau 0',
            1: 'Niveau 1',
            2: 'Niveau 2',
            3: 'Niveau 3'
        };

        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

        const onlineMembers = guild.members.cache.filter(m => 
            m.presence?.status === 'online' || 
            m.presence?.status === 'idle' || 
            m.presence?.status === 'dnd'
        ).size;

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`📊 ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
                { name: '🆔 ID', value: guild.id, inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
                { 
                    name: `👥 Membres (${guild.memberCount})`, 
                    value: `🟢 En ligne: ${onlineMembers}\n👤 Humains: ${guild.members.cache.filter(m => !m.user.bot).size}\n🤖 Bots: ${guild.members.cache.filter(m => m.user.bot).size}`,
                    inline: true
                },
                { 
                    name: `📁 Canaux (${guild.channels.cache.size})`, 
                    value: `💬 Texte: ${textChannels}\n🔊 Vocal: ${voiceChannels}\n📂 Catégories: ${categories}`,
                    inline: true
                },
                { 
                    name: '🎭 Rôles', 
                    value: guild.roles.cache.size.toString(),
                    inline: true
                },
                { 
                    name: '😀 Emojis', 
                    value: `${guild.emojis.cache.size} / ${guild.premiumTier === 0 ? 50 : guild.premiumTier === 1 ? 100 : guild.premiumTier === 2 ? 150 : 250}`,
                    inline: true
                },
                { 
                    name: '💎 Boost', 
                    value: `${boostLevels[guild.premiumTier]}\n${guild.premiumSubscriptionCount || 0} boost(s)`,
                    inline: true
                },
                { 
                    name: '🔒 Vérification', 
                    value: verificationLevels[guild.verificationLevel],
                    inline: true
                }
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        if (guild.banner) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await interaction.reply({ embeds: [embed] });
    }
};
