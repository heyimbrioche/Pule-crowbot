const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Configure le système d\'auto-role')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('panel')
                .setDescription('Crée un panneau d\'auto-role')
                .addStringOption(option =>
                    option.setName('titre')
                        .setDescription('Titre du panneau')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description du panneau')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('couleur')
                        .setDescription('Couleur de l\'embed (hex)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajoute un rôle au panneau')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('ID du message du panneau')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle à ajouter')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('label')
                        .setDescription('Texte du bouton')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji du bouton')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('style')
                        .setDescription('Style du bouton')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Bleu (Primary)', value: 'Primary' },
                            { name: 'Gris (Secondary)', value: 'Secondary' },
                            { name: 'Vert (Success)', value: 'Success' },
                            { name: 'Rouge (Danger)', value: 'Danger' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Retire un rôle du panneau')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('ID du message du panneau')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle à retirer')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Liste les panneaux d\'auto-role'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Configure un rôle donné automatiquement à l\'arrivée')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle à donner (laissez vide pour désactiver)')
                        .setRequired(false))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'panel':
                await this.createPanel(interaction);
                break;
            case 'add':
                await this.addRole(interaction);
                break;
            case 'remove':
                await this.removeRole(interaction);
                break;
            case 'list':
                await this.listPanels(interaction);
                break;
            case 'join':
                await this.setJoinRole(interaction);
                break;
        }
    },

    async createPanel(interaction) {
        const title = interaction.options.getString('titre') || '🎭 Choisissez vos rôles';
        const description = interaction.options.getString('description') || 
            'Cliquez sur les boutons ci-dessous pour obtenir ou retirer un rôle.';
        const color = interaction.options.getString('couleur') || '#5865F2';

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setFooter({ 
                text: 'Cliquez pour obtenir/retirer un rôle',
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();

        const message = await interaction.channel.send({ embeds: [embed] });

        // Sauvegarder le panneau
        const panels = await db.get(`autorole_panels_${interaction.guild.id}`) || {};
        panels[message.id] = {
            channelId: interaction.channel.id,
            roles: [],
            embedData: { title, description, color }
        };
        await db.set(`autorole_panels_${interaction.guild.id}`, panels);

        await interaction.reply({
            content: `✅ Panneau créé ! ID du message : \`${message.id}\`\n\nUtilisez \`/autorole add message-id:${message.id} role:@Role\` pour ajouter des rôles.`,
            flags: MessageFlags.Ephemeral
        });
    },

    async addRole(interaction) {
        const messageId = interaction.options.getString('message-id');
        const role = interaction.options.getRole('role');
        const label = interaction.options.getString('label') || role.name;
        const emoji = interaction.options.getString('emoji');
        const style = interaction.options.getString('style') || 'Primary';

        // Vérifier le panneau
        const panels = await db.get(`autorole_panels_${interaction.guild.id}`) || {};
        const panel = panels[messageId];

        if (!panel) {
            return interaction.reply({
                content: '❌ Panneau non trouvé. Vérifiez l\'ID du message.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Vérifier si le rôle est déjà dans le panneau
        if (panel.roles.find(r => r.roleId === role.id)) {
            return interaction.reply({
                content: '❌ Ce rôle est déjà dans le panneau.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Vérifier la limite de boutons (25 max, 5 par row)
        if (panel.roles.length >= 25) {
            return interaction.reply({
                content: '❌ Limite de 25 rôles atteinte pour ce panneau.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Ajouter le rôle
        panel.roles.push({
            roleId: role.id,
            label: label,
            emoji: emoji,
            style: style
        });
        await db.set(`autorole_panels_${interaction.guild.id}`, panels);

        // Mettre à jour le message
        await this.updatePanelMessage(interaction, messageId, panel);

        await interaction.reply({
            content: `✅ Rôle ${role} ajouté au panneau !`,
            flags: MessageFlags.Ephemeral
        });
    },

    async removeRole(interaction) {
        const messageId = interaction.options.getString('message-id');
        const role = interaction.options.getRole('role');

        const panels = await db.get(`autorole_panels_${interaction.guild.id}`) || {};
        const panel = panels[messageId];

        if (!panel) {
            return interaction.reply({
                content: '❌ Panneau non trouvé.',
                flags: MessageFlags.Ephemeral
            });
        }

        const roleIndex = panel.roles.findIndex(r => r.roleId === role.id);
        if (roleIndex === -1) {
            return interaction.reply({
                content: '❌ Ce rôle n\'est pas dans le panneau.',
                flags: MessageFlags.Ephemeral
            });
        }

        panel.roles.splice(roleIndex, 1);
        await db.set(`autorole_panels_${interaction.guild.id}`, panels);

        // Mettre à jour le message
        await this.updatePanelMessage(interaction, messageId, panel);

        await interaction.reply({
            content: `✅ Rôle ${role} retiré du panneau.`,
            flags: MessageFlags.Ephemeral
        });
    },

    async updatePanelMessage(interaction, messageId, panel) {
        try {
            const channel = interaction.guild.channels.cache.get(panel.channelId);
            const message = await channel.messages.fetch(messageId);

            const rows = [];
            let currentRow = new ActionRowBuilder();
            let buttonCount = 0;

            for (const roleData of panel.roles) {
                const button = new ButtonBuilder()
                    .setCustomId(`autorole_${roleData.roleId}`)
                    .setLabel(roleData.label)
                    .setStyle(ButtonStyle[roleData.style]);

                if (roleData.emoji) {
                    button.setEmoji(roleData.emoji);
                }

                currentRow.addComponents(button);
                buttonCount++;

                if (buttonCount === 5) {
                    rows.push(currentRow);
                    currentRow = new ActionRowBuilder();
                    buttonCount = 0;
                }
            }

            if (buttonCount > 0) {
                rows.push(currentRow);
            }

            await message.edit({ components: rows });
        } catch (error) {
            console.error('Erreur mise à jour panneau:', error);
        }
    },

    async listPanels(interaction) {
        const panels = await db.get(`autorole_panels_${interaction.guild.id}`) || {};
        const panelEntries = Object.entries(panels);

        if (panelEntries.length === 0) {
            return interaction.reply({
                content: '❌ Aucun panneau d\'auto-role configuré.',
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎭 Panneaux d\'Auto-Role')
            .setDescription(
                panelEntries.map(([msgId, panel]) => 
                    `**Message ID:** \`${msgId}\`\n` +
                    `**Canal:** <#${panel.channelId}>\n` +
                    `**Rôles:** ${panel.roles.length > 0 ? panel.roles.map(r => `<@&${r.roleId}>`).join(', ') : 'Aucun'}\n`
                ).join('\n───────────────\n')
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },

    async setJoinRole(interaction) {
        const role = interaction.options.getRole('role');

        if (role) {
            // Vérifier si le rôle est attribuable
            if (role.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({
                    content: '❌ Je ne peux pas attribuer ce rôle (position trop élevée).',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Sauvegarder dans la config welcome existante
            const welcomeConfig = await db.get(`welcome_${interaction.guild.id}`) || {};
            welcomeConfig.autoRoleId = role.id;
            await db.set(`welcome_${interaction.guild.id}`, welcomeConfig);

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('✅ Rôle d\'arrivée configuré')
                .setDescription(`Les nouveaux membres recevront automatiquement le rôle ${role}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } else {
            // Désactiver le rôle auto
            const welcomeConfig = await db.get(`welcome_${interaction.guild.id}`) || {};
            welcomeConfig.autoRoleId = null;
            await db.set(`welcome_${interaction.guild.id}`, welcomeConfig);

            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('✅ Rôle d\'arrivée désactivé')
                .setDescription('Les nouveaux membres ne recevront plus de rôle automatique.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
};
