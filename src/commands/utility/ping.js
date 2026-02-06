const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche la latence du bot'),

    async execute(interaction, client) {
        const response = await interaction.reply({ 
            content: '🏓 Calcul du ping...', 
            withResponse: true 
        });
        const sent = response.resource.message;

        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const getStatus = (ms) => {
            if (ms < 100) return '🟢 Excellent';
            if (ms < 200) return '🟡 Bon';
            if (ms < 400) return '🟠 Moyen';
            return '🔴 Élevé';
        };

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🏓 Pong !')
            .addFields(
                { name: '📡 Latence Bot', value: `${latency}ms ${getStatus(latency)}`, inline: true },
                { name: '💓 API Discord', value: `${apiLatency}ms ${getStatus(apiLatency)}`, inline: true }
            )
            .setFooter({ text: `Uptime: ${formatUptime(client.uptime)}` })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}j ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
