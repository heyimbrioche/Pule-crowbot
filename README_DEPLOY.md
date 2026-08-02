# 🚀 Guide de Déploiement

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
