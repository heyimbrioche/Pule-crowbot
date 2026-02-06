const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        // Récupérer la configuration
        const welcomeConfig = await db.get(`welcome_${member.guild.id}`) || {};

        // Attribuer le rôle automatique (fonctionne indépendamment du message de bienvenue)
        if (welcomeConfig.autoRoleId) {
            const role = member.guild.roles.cache.get(welcomeConfig.autoRoleId);
            if (role) {
                try {
                    await member.roles.add(role);
                    console.log(`✅ Auto-role ${role.name} donné à ${member.user.tag}`);
                } catch (error) {
                    console.error('Erreur attribution rôle auto:', error);
                }
            }
        }

        // Message de bienvenue (optionnel)
        if (!welcomeConfig.enabled) return;

        const channel = member.guild.channels.cache.get(welcomeConfig.channelId);
        if (!channel) return;

        // Remplacer les variables dans le message
        let message = welcomeConfig.message || 'Bienvenue {user} sur **{server}** ! Tu es notre {memberCount}ème membre !';
        message = message
            .replace(/{user}/g, member.toString())
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount);

        // Créer l'embed de bienvenue
        const embed = new EmbedBuilder()
            .setColor((welcomeConfig.color || '#5865F2').replace(/\s/g, ''))
            .setTitle('👋 Nouveau membre !')
            .setDescription(message)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage(welcomeConfig.bannerUrl || null)
            .setFooter({ 
                text: member.guild.name, 
                iconURL: member.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur envoi message bienvenue:', error);
        }
    }
};
