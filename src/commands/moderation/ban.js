const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannit un membre du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison du bannissement')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('supprimer-messages')
                .setDescription('Nombre de jours de messages à supprimer (0-7)')
                .setMinValue(0)
                .setMaxValue(7)),

    async execute(interaction) {
        const user = interaction.options.getUser('membre');
        const member = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
        const deleteMessages = interaction.options.getInteger('supprimer-messages') || 0;

        if (member) {
            if (!member.bannable) {
                return interaction.reply({
                    content: '❌ Je ne peux pas bannir ce membre (rôle trop élevé ou permissions insuffisantes).',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (member.id === interaction.user.id) {
                return interaction.reply({
                    content: '❌ Vous ne pouvez pas vous bannir vous-même.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        // Envoyer un DM à l'utilisateur
        try {
            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ED4245')
                        .setTitle(`🔨 Vous avez été banni de ${interaction.guild.name}`)
                        .addFields({ name: 'Raison', value: reason })
                        .setTimestamp()
                ]
            });
        } catch {}

        await interaction.guild.members.ban(user, { 
            reason: `${reason} | Par: ${interaction.user.tag}`,
            deleteMessageDays: deleteMessages
        });

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🔨 Membre Banni')
            .addFields(
                { name: 'Membre', value: user.tag, inline: true },
                { name: 'Modérateur', value: interaction.user.toString(), inline: true },
                { name: 'Raison', value: reason }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
