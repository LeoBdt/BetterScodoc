#!/bin/bash
# Script pour empaqueter l'extension
echo "📦 Empaquetage de BetterScoDoc..."

# S'assurer d'avoir la dernière version compilée
npm run build

# Créer un fichier zip
if [ -f "BetterScoDoc.zip" ]; then
    rm BetterScoDoc.zip
fi

cd dist
zip -r ../BetterScoDoc.zip *
cd ..

echo "✅ BetterScoDoc.zip créé avec succès !"
