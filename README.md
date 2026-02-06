# 🤖 Pulse CrowBot

Bot Discord complet pour la gestion de serveur avec système de tickets, messages de bienvenue, modération et plus encore.

## 📋 Fonctionnalités

### 🎫 Système de Tickets
- Création de tickets avec catégories (Support, Bug, Suggestion, Partenariat, Autre)
- Modal pour décrire le problème
- Système de claim pour le staff
- Transcription automatique à la fermeture
- Logs des tickets

### 👋 Messages de Bienvenue/Départ
- Messages personnalisables avec variables
- Image/banner optionnel
- Attribution automatique de rôle
- Messages de départ configurables

### 🛡️ Modération
- `/kick` - Expulser un membre
- `/ban` - Bannir un membre
- `/unban` - Débannir un utilisateur
- `/timeout` - Timeout temporaire
- `/untimeout` - Retirer le timeout
- `/clear` - Supprimer des messages
- `/warn` - Avertir un membre
- `/warns` - Voir les avertissements
- `/unwarn` - Retirer un avertissement

### 🔧 Utilitaires
- `/help` - Menu d'aide interactif
- `/ping` - Latence du bot
- `/avatar` - Voir l'avatar d'un utilisateur
- `/userinfo` - Informations sur un utilisateur
- `/serverinfo` - Informations sur le serveur
- `/poll` - Créer un sondage

### 🎭 Auto-Role
- `/autorole panel` - Créer un panneau de rôles avec boutons
- `/autorole add` - Ajouter un rôle au panneau
- `/autorole remove` - Retirer un rôle du panneau
- `/autorole list` - Voir tous les panneaux
- `/autorole join` - Rôle automatique à l'arrivée

### ⚙️ Administration
- `/say` - Faire parler le bot
- `/embed` - Créer un embed personnalisé
- `/role add/remove/all` - Gérer les rôles
- `/slowmode` - Mode lent
- `/lock` - Verrouiller un canal
- `/unlock` - Déverrouiller un canal

## 🚀 Installation

### Prérequis
- [Node.js](https://nodejs.org/) v16.11.0 ou supérieur
- Un bot Discord créé sur le [Discord Developer Portal](https://discord.com/developers/applications)

### Étapes

1. **Clonez ou téléchargez le projet**

2. **Installez les dépendances**
```bash
npm install
```

3. **Configurez le bot**
   - Copiez `config.example.json` vers `config.json`
   - Remplissez les valeurs :
```json
{
  "token": "VOTRE_TOKEN_BOT",
  "clientId": "ID_DE_VOTRE_APPLICATION",
  "guildId": "ID_DE_VOTRE_SERVEUR"
}
```

4. **Déployez les commandes slash**
```bash
node src/deploy-commands.js
```

5. **Lancez le bot**
```bash
npm start
```

## ⚙️ Configuration du Bot Discord

### Intents requis (Developer Portal)
Dans votre application Discord, activez ces intents privilegiés :
- ✅ PRESENCE INTENT
- ✅ SERVER MEMBERS INTENT
- ✅ MESSAGE CONTENT INTENT

### Permissions du bot
Invitez le bot avec ces permissions :
- Gérer les rôles
- Gérer les canaux
- Expulser des membres
- Bannir des membres
- Modérer les membres
- Envoyer des messages
- Gérer les messages
- Incorporer des liens
- Joindre des fichiers
- Lire l'historique des messages
- Ajouter des réactions

**URL d'invitation recommandée** : Utilisez le générateur d'URL dans Discord Developer Portal > OAuth2 > URL Generator

## 📖 Guide de Configuration

### Configurer les Tickets
```
/ticket-setup categorie:#tickets role-support:@Support logs:#logs-tickets
/ticket-panel
```

### Configurer la Bienvenue
```
/welcome-setup channel:#bienvenue message:Bienvenue {user} ! 🎉 auto-role:@Membre
/welcome-test
```

### Configurer les Départs
```
/leave-setup channel:#departs message:Au revoir {username}...
```

### Configurer l'Auto-Role
```
# Créer un panneau de rôles
/autorole panel titre:Choisissez vos rôles

# Ajouter des rôles au panneau (utilisez l'ID du message)
/autorole add message-id:123456789 role:@Joueur emoji:🎮 style:Vert
/autorole add message-id:123456789 role:@Artiste emoji:🎨 style:Bleu

# Configurer un rôle automatique à l'arrivée
/autorole join role:@Membre
```

## 📝 Variables disponibles

Pour les messages de bienvenue/départ :
- `{user}` - Mention de l'utilisateur
- `{username}` - Nom de l'utilisateur
- `{server}` - Nom du serveur
- `{memberCount}` - Nombre de membres

## 🔧 Développement

```bash
# Mode développement avec rechargement automatique
npm run dev
```

## 📁 Structure du projet

```
Pulse crowbot/
├── src/
│   ├── commands/
│   │   ├── admin/
│   │   ├── moderation/
│   │   ├── tickets/
│   │   ├── utility/
│   │   └── welcome/
│   ├── events/
│   ├── handlers/
│   ├── deploy-commands.js
│   └── index.js
├── config.json
├── config.example.json
└── package.json
```

## ❓ Support

Si vous avez des questions ou des problèmes, n'hésitez pas à ouvrir une issue.

---
Made with ❤️ by Pulse
