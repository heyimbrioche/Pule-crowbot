const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Charger la configuration
let config;
try {
    config = require('../config.json');
} catch {
    console.error('❌ Fichier config.json introuvable ! Copiez config.example.json vers config.json et remplissez les valeurs.');
    process.exit(1);
}

// Créer le client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ]
});

// Collections pour les commandes
client.commands = new Collection();
client.cooldowns = new Collection();

// Charger les commandes
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
                client.commands.set(command.data.name, command);
                console.log(`✅ Commande chargée: ${command.data.name}`);
            } else {
                console.log(`⚠️ Commande invalide: ${filePath}`);
            }
        }
    }
}

// Charger les événements
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`✅ Événement chargé: ${event.name}`);
}

// Connexion du bot
client.login(config.token);
