const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

const TICKET_CATEGORIES = {
    support: { emoji: '🎫', label: 'Support Général', description: 'Besoin d\'aide ? C\'est ici.', color: '#5865F2' },
    bug: { emoji: '🐛', label: 'Signaler un Bug', description: 'Vous avez trouvé un bug ?', color: '#ED4245' },
    suggestion: { emoji: '💡', label: 'Suggestion', description: 'Proposez une idée.', color: '#FEE75C' },
    partnership: { emoji: '🤝', label: 'Partenariat', description: 'Demande de partenariat.', color: '#57F287' },
    other: { emoji: '📝', label: 'Autre', description: 'Autre demande.', color: '#EB459E' }
};

module.exports = {
    TICKET_CATEGORIES,

    async handleButton(interaction, client) {
        const customId = interaction.customId;

        // Boutons de catégorie : ticket_cat_support, ticket_cat_bug, etc.
        if (customId.startsWith('ticket_cat_')) {
            const category = customId.replace('ticket_cat_', '');
            if (TICKET_CATEGORIES[category]) {
                return this.showTicketModal(interaction, category);
            }
        }

        const [action, ...args] = customId.split('_').slice(1);

        switch (action) {
            case 'close':
                await this.closeTicket(interaction);
                break;
            case 'confirm':
                await this.confirmClose(interaction, args[0]);
                break;
            case 'cancel':
                await interaction.message.delete().catch(() => {});
                break;
            case 'transcript':
                await this.createTranscript(interaction);
                break;
            case 'claim':
                await this.claimTicket(interaction);
                break;
        }
    },

    async handleSelectMenu(interaction, client) {
        const category = interaction.values[0];
        await this.showTicketModal(interaction, category);
    },

    async handleModal(interaction, client) {
        const category = interaction.customId.replace('ticket_modal_', '');
        const subject = interaction.fields.getTextInputValue('ticket_subject');
        const description = interaction.fields.getTextInputValue('ticket_description');

        await this.createTicket(interaction, category, subject, description, client);
    },

    async showTicketModal(interaction, category) {
        const modal = new ModalBuilder()
            .setCustomId(`ticket_modal_${category}`)
            .setTitle(`Nouveau Ticket - ${TICKET_CATEGORIES[category].label}`);

        const subjectInput = new TextInputBuilder()
            .setCustomId('ticket_subject')
            .setLabel('Sujet du ticket')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Décrivez brièvement votre demande')
            .setRequired(true)
            .setMaxLength(100);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('ticket_description')
            .setLabel('Description détaillée')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Expliquez votre demande en détail...')
            .setRequired(true)
            .setMaxLength(1000);

        modal.addComponents(
            new ActionRowBuilder().addComponents(subjectInput),
            new ActionRowBuilder().addComponents(descriptionInput)
        );

        await interaction.showModal(modal);
    },

    async createTicket(interaction, category, subject, description, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const ticketConfig = await db.get(`tickets_${interaction.guild.id}`);
        
        // Vérifier si le système de tickets est configuré
        if (!ticketConfig || !ticketConfig.categoryId) {
            return interaction.editReply({
                content: '❌ Le système de tickets n\'est pas configuré. Un administrateur doit utiliser `/ticket setup`.'
            });
        }

        // Vérifier si l'utilisateur a déjà un ticket ouvert dans la guild
        const allData = await db.all();
        const existingUserTicket = allData.find(d =>
            d.id.startsWith('ticket_') &&
            d.value.owner === interaction.user.id
        );

        if (existingUserTicket) {
            return interaction.editReply({
                content: '❌ Vous avez déjà un ticket ouvert. Vous ne pouvez créer qu\'un seul ticket à la fois.'
            });
        }

        // Créer le canal du ticket
        const ticketNumber = (await db.get(`ticketCount_${interaction.guild.id}`) || 0) + 1;
        await db.set(`ticketCount_${interaction.guild.id}`, ticketNumber);

        const channelName = `${TICKET_CATEGORIES[category].emoji}-${ticketNumber}-${interaction.user.username}`.substring(0, 100);

        try {
            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: ticketConfig.categoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels
                        ]
                    }
                ]
            });

            // Ajouter les rôles de support
            if (ticketConfig.supportRoleId) {
                await channel.permissionOverwrites.edit(ticketConfig.supportRoleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    AttachFiles: true,
                    ReadMessageHistory: true
                });
            }

            // Sauvegarder les infos du ticket
            await db.set(`ticket_${channel.id}`, {
                owner: interaction.user.id,
                category: category,
                subject: subject,
                createdAt: Date.now(),
                number: ticketNumber
            });

            // Embed d'ouverture
            const categoryInfo = TICKET_CATEGORIES[category];
            const embed = new EmbedBuilder()
                .setColor(categoryInfo.color)
                .setTitle(`${categoryInfo.emoji} Ticket #${ticketNumber} - ${categoryInfo.label}`)
                .setDescription(`**Sujet:** ${subject}\n\n**Description:**\n${description}`)
                .addFields(
                    { name: '👤 Créé par', value: interaction.user.toString(), inline: true },
                    { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setFooter({ text: 'Un membre du staff vous répondra bientôt.' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Fermer le ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Prendre en charge')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✋')
            );

            await channel.send({
                content: `${interaction.user} ${ticketConfig.supportRoleId ? `<@&${ticketConfig.supportRoleId}>` : ''}`,
                embeds: [embed],
                components: [buttons]
            });

            await interaction.editReply({
                content: `✅ Votre ticket a été créé ! ${channel}`
            });

            // Log
            if (ticketConfig.logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(ticketConfig.logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#57F287')
                        .setTitle('🎫 Nouveau Ticket')
                        .addFields(
                            { name: 'Ticket', value: channel.toString(), inline: true },
                            { name: 'Créateur', value: interaction.user.toString(), inline: true },
                            { name: 'Catégorie', value: `${categoryInfo.emoji} ${categoryInfo.label}`, inline: true }
                        )
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

        } catch (error) {
            console.error('Erreur création ticket:', error);
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de la création du ticket.'
            });
        }
    },

    async closeTicket(interaction) {
        const ticketData = await db.get(`ticket_${interaction.channel.id}`);
        
        if (!ticketData) {
            return interaction.reply({
                content: '❌ Ce canal n\'est pas un ticket.',
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🔒 Fermer le ticket ?')
            .setDescription('Êtes-vous sûr de vouloir fermer ce ticket ? Cette action créera une transcription avant la fermeture.');

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`ticket_confirm_${interaction.channel.id}`)
                .setLabel('Confirmer')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('ticket_cancel')
                .setLabel('Annuler')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [buttons]
        });
    },

    async confirmClose(interaction, channelId) {
        await interaction.deferUpdate();

        // Récupérer le canal (fetch si pas en cache)
        const channel = interaction.channel || await interaction.client.channels.fetch(channelId).catch(() => null);
        if (!channel) return;

        const ticketConfig = await db.get(`tickets_${interaction.guild.id}`);
        const ticketData = await db.get(`ticket_${channel.id}`);

        // Créer la transcription
        const messages = await channel.messages.fetch({ limit: 100 });
        const transcript = messages.reverse().map(m => 
            `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content || '[Embed/Attachment]'}`
        ).join('\n');

        // Log de fermeture
        if (ticketConfig?.logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(ticketConfig.logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('🔒 Ticket Fermé')
                    .addFields(
                        { name: 'Ticket', value: `#${ticketData?.number || 'N/A'}`, inline: true },
                        { name: 'Fermé par', value: interaction.user.toString(), inline: true },
                        { name: 'Propriétaire', value: `<@${ticketData?.owner || 'inconnu'}>`, inline: true }
                    )
                    .setTimestamp();

                await logChannel.send({
                    embeds: [logEmbed],
                    files: [{
                        attachment: Buffer.from(transcript, 'utf-8'),
                        name: `ticket-${ticketData?.number || 'unknown'}-transcript.txt`
                    }]
                });
            }
        }

        // Envoyer la transcription au propriétaire du ticket
        if (ticketData?.owner) {
            try {
                const owner = await interaction.guild.members.fetch(ticketData.owner);
                if (owner) {
                    const transcriptEmbed = new EmbedBuilder()
                        .setColor('#ED4245')
                        .setTitle('🔒 Ticket Fermé')
                        .setDescription(`Votre ticket #${ticketData.number || 'N/A'} a été fermé.\nVoici la transcription complète de votre ticket.`)
                        .addFields(
                            { name: '📝 Sujet', value: ticketData.subject || 'Non spécifié', inline: false }
                        )
                        .setTimestamp();

                    await owner.send({
                        embeds: [transcriptEmbed],
                        files: [{
                            attachment: Buffer.from(transcript, 'utf-8'),
                            name: `ticket-${ticketData.number || 'unknown'}-transcript.txt`
                        }]
                    });
                }
            } catch (error) {
                console.log(`Impossible d'envoyer le transcript à ${ticketData.owner} : DMs fermés ou membre introuvable`);
            }
        }

        // Supprimer le ticket de la base de données
        await db.delete(`ticket_${channel.id}`);

        // Supprimer le canal
        await channel.delete().catch(() => {});
    },

    async claimTicket(interaction) {
        const ticketData = await db.get(`ticket_${interaction.channel.id}`);
        
        if (!ticketData) {
            return interaction.reply({
                content: '❌ Ce canal n\'est pas un ticket.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (ticketData.claimedBy) {
            return interaction.reply({
                content: `❌ Ce ticket est déjà pris en charge par <@${ticketData.claimedBy}>.`,
                flags: MessageFlags.Ephemeral
            });
        }

        ticketData.claimedBy = interaction.user.id;
        await db.set(`ticket_${interaction.channel.id}`, ticketData);

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(`✅ ${interaction.user} a pris en charge ce ticket.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async createTranscript(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = messages.reverse().map(m => 
            `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content || '[Embed/Attachment]'}`
        ).join('\n');

        await interaction.editReply({
            content: '📄 Voici la transcription du ticket :',
            files: [{
                attachment: Buffer.from(transcript, 'utf-8'),
                name: `transcript-${interaction.channel.name}.txt`
            }]
        });
    }
};
