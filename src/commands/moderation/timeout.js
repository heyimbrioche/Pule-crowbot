const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Met un membre en timeout (mute temporaire)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duree')
                .setDescription('Durée du timeout (ex: 10m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison du timeout')
                .setRequired(false)),

    async execute(interaction) {
        const member = interaction.options.getMember('membre');
        const duration = interaction.options.getString('duree');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';

        if (!member) {
            return interaction.reply({
                content: '❌ Ce membre n\'est pas sur le serveur.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (!member.moderatable) {
            return interaction.reply({
                content: '❌ Je ne peux pas timeout ce membre.',
                flags: MessageFlags.Ephemeral
            });
        }

        const msTime = ms(duration);
        if (!msTime || msTime < 5000 || msTime > 2419200000) { // 5s à 28 jours
            return interaction.reply({
                content: '❌ Durée invalide. Utilisez un format comme: 10m, 1h, 1d (max 28 jours).',
                flags: MessageFlags.Ephemeral
            });
        }

        // Envoyer un DM
        try {
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FEE75C')
                        .setTitle(`⏱️ Vous avez été timeout sur ${interaction.guild.name}`)
                        .addFields(
                            { name: 'Durée', value: duration, inline: true },
                            { name: 'Raison', value: reason }
                        )
                        .setTimestamp()
                ]
            });
        } catch {}

        await member.timeout(msTime, reason);

        const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('⏱️ Membre Timeout')
            .addFields(
                { name: 'Membre', value: member.user.tag, inline: true },
                { name: 'Durée', value: duration, inline: true },
                { name: 'Modérateur', value: interaction.user.toString(), inline: true },
                { name: 'Raison', value: reason }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
