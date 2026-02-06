const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-remove')
        .setDescription('Retire un utilisateur du ticket actuel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à retirer')
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

        if (user.id === ticketData.owner) {
            return interaction.reply({
                content: '❌ Vous ne pouvez pas retirer le propriétaire du ticket.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.channel.permissionOverwrites.delete(user.id);

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription(`✅ ${user} a été retiré du ticket.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
