const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Gère les rôles d\'un membre')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajoute un rôle à un membre')
                .addUserOption(option =>
                    option.setName('membre')
                        .setDescription('Le membre')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle à ajouter')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Retire un rôle à un membre')
                .addUserOption(option =>
                    option.setName('membre')
                        .setDescription('Le membre')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle à retirer')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('Donne un rôle à tous les membres')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle à donner')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const role = interaction.options.getRole('role');

        // Vérifier si le rôle est gérable
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({
                content: '❌ Je ne peux pas gérer ce rôle (position trop élevée).',
                flags: MessageFlags.Ephemeral
            });
        }

        if (role.managed) {
            return interaction.reply({
                content: '❌ Ce rôle est géré par une intégration et ne peut pas être modifié.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (subcommand === 'add') {
            const member = interaction.options.getMember('membre');
            
            if (member.roles.cache.has(role.id)) {
                return interaction.reply({
                    content: `❌ ${member} a déjà ce rôle.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await member.roles.add(role);

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`✅ Le rôle ${role} a été ajouté à ${member}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'remove') {
            const member = interaction.options.getMember('membre');
            
            if (!member.roles.cache.has(role.id)) {
                return interaction.reply({
                    content: `❌ ${member} n'a pas ce rôle.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await member.roles.remove(role);

            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription(`✅ Le rôle ${role} a été retiré de ${member}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'all') {
            await interaction.deferReply();

            const members = await interaction.guild.members.fetch();
            let count = 0;

            for (const [, member] of members) {
                if (!member.roles.cache.has(role.id) && !member.user.bot) {
                    try {
                        await member.roles.add(role);
                        count++;
                    } catch {}
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`✅ Le rôle ${role} a été ajouté à **${count}** membre(s).`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};
