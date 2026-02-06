const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulse un membre du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à expulser')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison de l\'expulsion')
                .setRequired(false)),

    async execute(interaction) {
        const member = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';

        if (!member) {
            return interaction.reply({
                content: '❌ Ce membre n\'est pas sur le serveur.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                content: '❌ Je ne peux pas expulser ce membre (rôle trop élevé ou permissions insuffisantes).',
                flags: MessageFlags.Ephemeral
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ Vous ne pouvez pas vous expulser vous-même.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Envoyer un DM au membre
        try {
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ED4245')
                        .setTitle(`👢 Vous avez été expulsé de ${interaction.guild.name}`)
                        .addFields({ name: 'Raison', value: reason })
                        .setTimestamp()
                ]
            });
        } catch {}

        await member.kick(reason);

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('👢 Membre Expulsé')
            .addFields(
                { name: 'Membre', value: `${member.user.tag}`, inline: true },
                { name: 'Modérateur', value: interaction.user.toString(), inline: true },
                { name: 'Raison', value: reason }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
