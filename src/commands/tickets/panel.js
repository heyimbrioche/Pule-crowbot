const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder,
    MessageFlags
} = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { TICKET_CATEGORIES } = require('../../handlers/ticketHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Crée le panneau de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Titre du panneau')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description du panneau (utilisez \\n pour sauter une ligne)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('Couleur de l\'embed (hex)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('URL de l\'image en bas de l\'embed')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('thumbnail')
                .setDescription('URL de la miniature (en haut à droite)')
                .setRequired(false)),

    async execute(interaction) {
        const ticketConfig = await db.get(`tickets_${interaction.guild.id}`);
        
        if (!ticketConfig) {
            return interaction.reply({
                content: '❌ Le système de tickets n\'est pas configuré. Utilisez `/ticket-setup` d\'abord.',
                flags: MessageFlags.Ephemeral
            });
        }

        const title = interaction.options.getString('titre') || '📬 Accéder au support';
        const rawDescription = interaction.options.getString('description');
        const color = (interaction.options.getString('couleur') || '#5865F2').replace(/\s/g, '');
        const image = interaction.options.getString('image');
        const thumbnail = interaction.options.getString('thumbnail');

        // Construire la description
        let description = '';
        
        if (rawDescription) {
            description = rawDescription.replace(/\\n/g, '\n');
        } else {
            description = `Pour **contacter** notre support, il vous suffit de choisir la catégorie correspondante à votre demande dans le menu déroulant ci-dessous.`;
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setFooter({ 
                text: `${interaction.guild.name} © ${new Date().getFullYear()}`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        if (image) embed.setImage(image);
        if (thumbnail) embed.setThumbnail(thumbnail);

        // Menu déroulant directement sous l'embed
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_category')
            .setPlaceholder('Sélectionner une catégorie')
            .addOptions(
                Object.entries(TICKET_CATEGORIES).map(([key, value]) => ({
                    label: value.label,
                    value: key,
                    emoji: value.emoji,
                    description: value.description
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Panneau de tickets créé !', flags: MessageFlags.Ephemeral });
    }
};
