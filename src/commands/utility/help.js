const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes'),

    async execute(interaction, client) {
        const categories = {
            tickets: {
                emoji: '🎫',
                name: 'Tickets',
                description: 'Système de support par tickets'
            },
            welcome: {
                emoji: '👋',
                name: 'Bienvenue',
                description: 'Messages de bienvenue et départ'
            },
            moderation: {
                emoji: '🛡️',
                name: 'Modération',
                description: 'Commandes de modération'
            },
            utility: {
                emoji: '🔧',
                name: 'Utilitaires',
                description: 'Commandes utilitaires diverses'
            },
            autorole: {
                emoji: '🎭',
                name: 'Auto-Role',
                description: 'Système de rôles automatiques'
            },
            admin: {
                emoji: '⚙️',
                name: 'Administration',
                description: 'Commandes administrateur'
            }
        };

        // Page principale
        const mainEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📚 Menu d\'Aide - Pulse Bot')
            .setDescription(
                'Bienvenue dans le menu d\'aide !\n\n' +
                'Utilisez le menu déroulant ci-dessous pour voir les commandes de chaque catégorie.\n\n' +
                Object.entries(categories).map(([key, cat]) => 
                    `${cat.emoji} **${cat.name}** - ${cat.description}`
                ).join('\n')
            )
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ 
                text: `${client.commands.size} commandes disponibles`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_menu')
            .setPlaceholder('Sélectionnez une catégorie...')
            .addOptions(
                Object.entries(categories).map(([key, cat]) => ({
                    label: cat.name,
                    value: key,
                    emoji: cat.emoji,
                    description: cat.description
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const response = await interaction.reply({ 
            embeds: [mainEmbed], 
            components: [row],
            withResponse: true 
        });
        const reply = response.resource.message;

        // Collector pour le menu
        const collector = reply.createMessageComponentCollector({
            time: 120000
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: '❌ Ce menu ne vous appartient pas.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const category = i.values[0];

            const commandsList = {
                tickets: ['ticket-setup', 'ticket-panel', 'ticket-add', 'ticket-remove'],
                welcome: ['welcome-setup', 'leave-setup', 'welcome-test'],
                moderation: ['kick', 'ban', 'unban', 'timeout', 'untimeout', 'clear', 'warn', 'warns', 'unwarn'],
                utility: ['help', 'ping', 'avatar', 'userinfo', 'serverinfo', 'poll'],
                autorole: ['autorole'],
                admin: ['say', 'embed', 'role', 'slowmode', 'lock', 'unlock', 'autorole', 'suggestion-setup']
            };

            const catCommands = commandsList[category] || [];
            const catInfo = categories[category];

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`${catInfo.emoji} ${catInfo.name}`)
                .setDescription(
                    catCommands.length > 0 
                        ? catCommands.map(name => {
                            const cmd = client.commands.get(name);
                            return cmd ? `\`/${name}\` - ${cmd.data.description}` : `\`/${name}\``;
                        }).join('\n')
                        : 'Aucune commande dans cette catégorie.'
                )
                .setFooter({ text: 'Utilisez /commande pour plus d\'informations' })
                .setTimestamp();

            await i.update({ embeds: [embed], components: [row] });
        });

        collector.on('end', () => {
            reply.edit({ components: [] }).catch(() => {});
        });
    }
};
