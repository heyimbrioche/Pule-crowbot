const { InteractionType, Collection, MessageFlags } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Gérer les commandes slash
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            // Système de cooldown
            const { cooldowns } = client;
            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const cooldownAmount = (command.cooldown || 3) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return interaction.reply({
                        content: `⏳ Attendez encore ${timeLeft.toFixed(1)} secondes avant d'utiliser \`/${command.data.name}\`.`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Erreur commande ${interaction.commandName}:`, error);
                const reply = {
                    content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
                    flags: MessageFlags.Ephemeral
                };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            }
        }

        // Gérer les boutons
        if (interaction.isButton()) {
            try {
                // Tickets
                if (interaction.customId.startsWith('ticket_')) {
                    const ticketHandler = require('../handlers/ticketHandler');
                    await ticketHandler.handleButton(interaction, client);
                }
                // Auto-role
                else if (interaction.customId.startsWith('autorole_')) {
                    const autoroleHandler = require('../handlers/autoroleHandler');
                    await autoroleHandler.handleButton(interaction, client);
                }
                // Bug report
                else if (interaction.customId.startsWith('bug_')) {
                    const bugHandler = require('../handlers/bugHandler');
                    await bugHandler.handleButton(interaction, client);
                }
            } catch (error) {
                console.error('Erreur bouton:', error);
                await interaction.reply({
                    content: '❌ Une erreur est survenue.',
                    flags: MessageFlags.Ephemeral
                }).catch(() => {});
            }
        }

        // Gérer les menus de sélection
        if (interaction.isStringSelectMenu()) {
            try {
                if (interaction.customId === 'ticket_category') {
                    const ticketHandler = require('../handlers/ticketHandler');
                    await ticketHandler.handleSelectMenu(interaction, client);
                }
            } catch (error) {
                console.error('Erreur select menu:', error);
                await interaction.reply({
                    content: '❌ Une erreur est survenue.',
                    flags: MessageFlags.Ephemeral
                }).catch(() => {});
            }
        }

        // Gérer les modals
        if (interaction.isModalSubmit()) {
            try {
                if (interaction.customId.startsWith('ticket_modal_')) {
                    const ticketHandler = require('../handlers/ticketHandler');
                    await ticketHandler.handleModal(interaction, client);
                }
            } catch (error) {
                console.error('Erreur modal:', error);
                await interaction.reply({
                    content: '❌ Une erreur est survenue.',
                    flags: MessageFlags.Ephemeral
                }).catch(() => {});
            }
        }
    }
};
