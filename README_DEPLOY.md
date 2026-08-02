# Guide de Déploiement

## Erreur ts-node / fileExists (Pterodactyl)

Si tu vois :

```text
TypeError: Cannot read properties of undefined (reading 'fileExists')
  at readConfig (.../ts-node/dist/configuration.js)
```

Le panel lance le bot avec **ts-node** alors que ce projet est en **JavaScript**.

### Correctif obligatoire dans le panel

1. Ouvre le serveur Pterodactyl → **Startup**
2. **Main File** / `BOT_JS_FILE` = `index.js` (pas de `.ts`)
3. Remplace la commande de démarrage pour utiliser **node**, pas ts-node :

```bash
if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/node /home/container/{{BOT_JS_FILE}}
```

Ou simplement (si le champ le permet) :

```bash
node index.js
```

**À éviter absolument :**
- `ts-node index.js`
- `npx ts-node ...`
- un Main File en `.ts`

### Correctif code (filet de sécurité)

Le repo inclut un `tsconfig.json` + la dépendance `typescript` pour limiter le crash
si un egg force encore ts-node. Le bon lancement reste `node index.js`.

## Problème de compatibilité Node.js v24

Si vous utilisez Node.js v24, le module `better-sqlite3` doit être recompilé après l'installation.

## Installation sur le serveur

```bash
# Cloner ou mettre à jour le repo
git pull

# Installer les dépendances
npm install

# Recompiler better-sqlite3 pour votre version de Node.js
npm rebuild better-sqlite3

# Lancer le bot
npm start
```

## Alternative : Utiliser le script de déploiement

```bash
chmod +x deploy.sh
./deploy.sh
npm start
```

## Versions recommandées

- Node.js: v20.x LTS (recommandé) ou v24.x (nécessite rebuild)
- npm: v10.x ou supérieur

## Problèmes connus

### Erreur `NODE_MODULE_VERSION mismatch`
**Solution:** Exécutez `npm rebuild better-sqlite3`

### Erreur `install scripts blocked`
**Solution:** Utilisez `npm install --ignore-scripts` puis `npm rebuild better-sqlite3`
