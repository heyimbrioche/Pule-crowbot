const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    async handleButton(interaction, client) {
        const roleId = interaction.customId.replace('autorole_', '');
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
            return interaction.reply({
                content: '❌ Ce rôle n\'existe plus.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Vérifier si le bot peut attribuer ce rôle
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({
                content: '❌ Je ne peux pas gérer ce rôle (ma position est trop basse).',
                flags: MessageFlags.Ephemeral
            });
        }

        const member = interaction.member;
        const hasRole = member.roles.cache.has(roleId);

        try {
            if (hasRole) {
                // Retirer le rôle
                await member.roles.remove(role);
                
                const embed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription(`❌ Le rôle ${role} vous a été **retiré**.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } else {
                // Ajouter le rôle
                await member.roles.add(role);
                
                const embed = new EmbedBuilder()
                    .setColor('#57F287')
                    .setDescription(`✅ Le rôle ${role} vous a été **attribué**.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            console.error('Erreur autorole:', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de la modification du rôle.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
