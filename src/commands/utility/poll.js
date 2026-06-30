const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Crée un sondage')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('question')
                .setDescription('La question du sondage')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('Option 1')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Option 2')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Option 3')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('Option 4')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option5')
                .setDescription('Option 5')
                .setRequired(false)),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const options = [
            interaction.options.getString('option1'),
            interaction.options.getString('option2'),
            interaction.options.getString('option3'),
            interaction.options.getString('option4'),
            interaction.options.getString('option5')
        ].filter(Boolean);

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
        const yesNo = ['✅', '❌'];

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📊 Sondage')
            .setDescription(`**${question}**`)
            .setFooter({ 
                text: `Sondage créé par ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        if (options.length > 0) {
            embed.addFields({
                name: 'Options',
                value: options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n')
            });
        } else {
            embed.addFields({
                name: 'Votez !',
                value: '✅ Oui\n❌ Non'
            });
        }

        await interaction.reply({ content: '✅ Sondage créé !', flags: MessageFlags.Ephemeral });
        
        const pollMessage = await interaction.channel.send({ embeds: [embed] });

        if (options.length > 0) {
            for (let i = 0; i < options.length; i++) {
                await pollMessage.react(emojis[i]);
            }
        } else {
            await pollMessage.react('✅');
            await pollMessage.react('❌');
        }
    }
};
