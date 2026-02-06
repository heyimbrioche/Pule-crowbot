const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        // Récupérer la configuration de départ
        const welcomeConfig = await db.get(`welcome_${member.guild.id}`);
        
        if (!welcomeConfig || !welcomeConfig.enabled || !welcomeConfig.leaveEnabled) return;

        const channel = member.guild.channels.cache.get(welcomeConfig.leaveChannelId || welcomeConfig.channelId);
        if (!channel) return;

        // Message de départ
        let message = welcomeConfig.leaveMessage || '{username} a quitté le serveur. Nous sommes maintenant {memberCount} membres.';
        message = message
            .replace(/{user}/g, member.toString())
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount);

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('👋 Au revoir...')
            .setDescription(message)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setFooter({ 
                text: member.guild.name, 
                iconURL: member.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur envoi message départ:', error);
        }
    }
};
