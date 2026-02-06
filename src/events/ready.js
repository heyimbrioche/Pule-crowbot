const { ActivityType } = require('discord.js');

module.exports = {
    name: 'clientReady',
    once: true,
    execute(client) {
        console.log('═══════════════════════════════════════');
        console.log(`🤖 ${client.user.tag} est en ligne !`);
        console.log(`📊 Serveurs: ${client.guilds.cache.size}`);
        console.log(`👥 Utilisateurs: ${client.users.cache.size}`);
        console.log('═══════════════════════════════════════');

        // Définir le statut du bot
        client.user.setPresence({
            activities: [{
                name: 'pulse.practice.ovh',
                type: ActivityType.Playing
            }],
            status: 'online'
        });
    }
};
