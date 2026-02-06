const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Crée un embed personnalisé')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Titre de l\'embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description de l\'embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('Couleur de l\'embed (hex, ex: #5865F2)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('URL de l\'image')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('thumbnail')
                .setDescription('URL de la miniature')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('Texte du footer')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal où envoyer l\'embed')
                .setRequired(false)),

    async execute(interaction) {
        const title = interaction.options.getString('titre');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('couleur') || '#5865F2';
        const image = interaction.options.getString('image');
        const thumbnail = interaction.options.getString('thumbnail');
        const footer = interaction.options.getString('footer');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description.replace(/\\n/g, '\n'))
            .setColor(color)
            .setTimestamp();

        if (image) embed.setImage(image);
        if (thumbnail) embed.setThumbnail(thumbnail);
        if (footer) embed.setFooter({ text: footer });

        try {
            await channel.send({ embeds: [embed] });
            await interaction.reply({ 
                content: `✅ Embed envoyé dans ${channel} !`, 
                flags: MessageFlags.Ephemeral 
            });
        } catch (error) {
            await interaction.reply({
                content: '❌ Erreur lors de l\'envoi de l\'embed. Vérifiez les URLs.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
