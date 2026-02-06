const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Affiche l\'avatar d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez voir l\'avatar')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;

        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`🖼️ Avatar de ${user.username}`)
            .setImage(avatarURL)
            .addFields(
                { 
                    name: '🔗 Liens', 
                    value: [
                        `[PNG](${user.displayAvatarURL({ format: 'png', size: 4096 })})`,
                        `[JPG](${user.displayAvatarURL({ format: 'jpg', size: 4096 })})`,
                        `[WEBP](${user.displayAvatarURL({ format: 'webp', size: 4096 })})`,
                        user.avatar?.startsWith('a_') ? `[GIF](${user.displayAvatarURL({ format: 'gif', size: 4096 })})` : null
                    ].filter(Boolean).join(' • ')
                }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
