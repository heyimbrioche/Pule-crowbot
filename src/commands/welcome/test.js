const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-test')
        .setDescription('Teste le message de bienvenue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const welcomeConfig = await db.get(`welcome_${interaction.guild.id}`);
        
        if (!welcomeConfig || !welcomeConfig.enabled) {
            return interaction.reply({
                content: '❌ Les messages de bienvenue ne sont pas configurés. Utilisez `/welcome-setup`.',
                flags: MessageFlags.Ephemeral
            });
        }

        const channel = interaction.guild.channels.cache.get(welcomeConfig.channelId);
        if (!channel) {
            return interaction.reply({
                content: '❌ Le canal de bienvenue configuré n\'existe plus.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Simuler le message de bienvenue
        let message = welcomeConfig.message || 'Bienvenue {user} sur **{server}** !';
        message = message
            .replace(/{user}/g, interaction.user.toString())
            .replace(/{username}/g, interaction.user.username)
            .replace(/{server}/g, interaction.guild.name)
            .replace(/{memberCount}/g, interaction.guild.memberCount);

        const embed = new EmbedBuilder()
            .setColor((welcomeConfig.color || '#5865F2').replace(/\s/g, ''))
            .setTitle('👋 Nouveau membre !')
            .setDescription(message)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage(welcomeConfig.bannerUrl || null)
            .setFooter({ 
                text: `${interaction.guild.name} • Test`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        await interaction.reply({ 
            content: `✅ Message de test envoyé dans ${channel} !`, 
            flags: MessageFlags.Ephemeral 
        });
    }
};
