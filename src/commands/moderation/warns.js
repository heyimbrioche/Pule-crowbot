const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription('Affiche les avertissements d\'un membre')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre dont vous voulez voir les warns')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('membre');
        const warns = await db.get(`warns_${interaction.guild.id}_${user.id}`) || [];

        if (warns.length === 0) {
            return interaction.reply({
                content: `✅ ${user.tag} n'a aucun avertissement.`,
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle(`⚠️ Avertissements de ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(`**Total: ${warns.length} avertissement(s)**\n\n` +
                warns.map((w, i) => 
                    `**${i + 1}.** ${w.reason}\n` +
                    `   └ Par: <@${w.moderator}> | <t:${Math.floor(w.date / 1000)}:R>\n` +
                    `   └ ID: \`${w.id}\``
                ).join('\n\n')
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
