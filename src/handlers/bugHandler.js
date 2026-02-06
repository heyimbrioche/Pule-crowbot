const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

const STATUSES = {
    accept: { label: 'Accepté', emoji: '✅', color: '#57F287' },
    fix:    { label: 'En cours de fix', emoji: '🔧', color: '#5865F2' },
    reject: { label: 'Rejeté', emoji: '❌', color: '#ED4245' }
};

module.exports = {
    async handleButton(interaction, client) {
        // Vérifier que l'utilisateur est admin
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ Seuls les administrateurs peuvent modifier le statut des bugs.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Extraire l'action (bug_accept_xxx, bug_fix_xxx, bug_reject_xxx)
        const parts = interaction.customId.split('_');
        const action = parts[1]; // accept, fix, reject

        const statusInfo = STATUSES[action];
        if (!statusInfo) return;

        // Récupérer l'embed actuel
        const message = interaction.message;
        const oldEmbed = message.embeds[0];
        if (!oldEmbed) return;

        // Reconstruire l'embed avec le nouveau statut
        const newEmbed = EmbedBuilder.from(oldEmbed)
            .setColor(statusInfo.color);

        // Mettre à jour le champ statut
        const fields = newEmbed.data.fields || [];
        const statusFieldIndex = fields.findIndex(f => f.name === '📌 Statut');
        
        if (statusFieldIndex !== -1) {
            fields[statusFieldIndex].value = `${statusInfo.emoji} ${statusInfo.label}`;
        }

        // Ajouter qui a changé le statut
        const modFieldIndex = fields.findIndex(f => f.name === '👤 Modifié par');
        if (modFieldIndex !== -1) {
            fields[modFieldIndex].value = interaction.user.toString();
        } else {
            fields.push({ name: '👤 Modifié par', value: interaction.user.toString(), inline: true });
        }

        newEmbed.setFields(fields);

        // Mettre à jour les boutons (désactiver celui sélectionné)
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`bug_accept_${Date.now()}`)
                .setLabel('Accepté')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
                .setDisabled(action === 'accept'),
            new ButtonBuilder()
                .setCustomId(`bug_fix_${Date.now()}`)
                .setLabel('En cours de fix')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔧')
                .setDisabled(action === 'fix'),
            new ButtonBuilder()
                .setCustomId(`bug_reject_${Date.now()}`)
                .setLabel('Rejeté')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
                .setDisabled(action === 'reject')
        );

        await interaction.update({ embeds: [newEmbed], components: [buttons] });
    }
};
