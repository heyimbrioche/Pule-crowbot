#!/bin/bash

echo "🔄 Installation des dépendances..."
npm install

echo "🔨 Rebuild des modules natifs..."
npm rebuild better-sqlite3

echo "✅ Déploiement terminé!"
