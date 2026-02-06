const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-add')
        .setDescription('Ajoute un utilisateur au ticket actuel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à ajouter')
                .setRequired(true)),

    async execute(interaction) {
        const ticketData = await db.get(`ticket_${interaction.channel.id}`);
        
        if (!ticketData) {
            return interaction.reply({
                content: '❌ Cette commande ne peut être utilisée que dans un ticket.',
                flags: MessageFlags.Ephemeral
            });
        }

        const user = interaction.options.getUser('utilisateur');

        await interaction.channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            AttachFiles: true,
            ReadMessageHistory: true
        });

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(`✅ ${user} a été ajouté au ticket.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
