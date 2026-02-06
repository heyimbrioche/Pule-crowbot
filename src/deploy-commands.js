const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Charger la configuration
let config;
try {
    config = require('../config.json');
} catch {
    console.error('❌ Fichier config.json introuvable !');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const stat = fs.statSync(folderPath);
    
    if (stat.isDirectory()) {
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            }
        }
    }
}

const rest = new REST().setToken(config.token);

(async () => {
    try {
        console.log(`🔄 Déploiement de ${commands.length} commandes...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );

        console.log(`✅ ${data.length} commandes déployées avec succès !`);
    } catch (error) {
        console.error('❌ Erreur lors du déploiement:', error);
    }
})();
