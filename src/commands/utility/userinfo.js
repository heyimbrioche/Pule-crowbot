const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Affiche les informations d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à rechercher')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const badges = {
            Staff: '<:staff:1234567890>',
            Partner: '<:partner:1234567890>',
            Hypesquad: '<:hypesquad:1234567890>',
            BugHunterLevel1: '🐛',
            BugHunterLevel2: '🐛',
            HypeSquadOnlineHouse1: '🏠', // Bravery
            HypeSquadOnlineHouse2: '🏠', // Brilliance
            HypeSquadOnlineHouse3: '🏠', // Balance
            PremiumEarlySupporter: '👑',
            VerifiedDeveloper: '👨‍💻',
            ActiveDeveloper: '🔧',
            VerifiedBot: '✅',
            CertifiedModerator: '🛡️'
        };

        const userFlags = user.flags?.toArray() || [];
        const badgeList = userFlags.map(flag => badges[flag] || flag).join(' ') || 'Aucun';

        const embed = new EmbedBuilder()
            .setColor(member?.displayHexColor || '#5865F2')
            .setTitle(`👤 Informations sur ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🏷️ Tag', value: user.tag, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '🤖 Bot', value: user.bot ? 'Oui' : 'Non', inline: true },
                { name: '📅 Compte créé', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
            );

        if (member) {
            embed.addFields(
                { name: '📥 A rejoint', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🎨 Couleur', value: member.displayHexColor, inline: true },
                { 
                    name: `🎭 Rôles (${member.roles.cache.size - 1})`, 
                    value: member.roles.cache
                        .filter(r => r.id !== interaction.guild.id)
                        .sort((a, b) => b.position - a.position)
                        .map(r => r.toString())
                        .slice(0, 10)
                        .join(', ') || 'Aucun'
                }
            );

            if (member.premiumSince) {
                embed.addFields({
                    name: '💎 Booster depuis',
                    value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`,
                    inline: true
                });
            }
        }

        embed.addFields({ name: '🏅 Badges', value: badgeList });
        embed.setFooter({ text: `Demandé par ${interaction.user.tag}` });
        embed.setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
