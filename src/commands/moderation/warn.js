const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Avertit un membre')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à avertir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison de l\'avertissement')
                .setRequired(true)),

    async execute(interaction) {
        const member = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison');

        if (!member) {
            return interaction.reply({
                content: '❌ Ce membre n\'est pas sur le serveur.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (member.user.bot) {
            return interaction.reply({
                content: '❌ Vous ne pouvez pas avertir un bot.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Ajouter l'avertissement
        const warns = await db.get(`warns_${interaction.guild.id}_${member.id}`) || [];
        const warnId = Date.now().toString(36);
        
        warns.push({
            id: warnId,
            reason: reason,
            moderator: interaction.user.id,
            date: Date.now()
        });

        await db.set(`warns_${interaction.guild.id}_${member.id}`, warns);

        // Envoyer un DM
        try {
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FEE75C')
                        .setTitle(`⚠️ Vous avez reçu un avertissement sur ${interaction.guild.name}`)
                        .addFields({ name: 'Raison', value: reason })
                        .setFooter({ text: `Avertissement #${warns.length}` })
                        .setTimestamp()
                ]
            });
        } catch {}

        const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('⚠️ Avertissement')
            .addFields(
                { name: 'Membre', value: member.user.tag, inline: true },
                { name: 'Modérateur', value: interaction.user.toString(), inline: true },
                { name: 'Total Warns', value: warns.length.toString(), inline: true },
                { name: 'Raison', value: reason }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `ID: ${warnId}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
