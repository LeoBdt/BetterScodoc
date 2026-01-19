#!/bin/bash
# Script pour empaqueter l'extension
echo "📦 Empaquetage de BetterScoDoc..."

# S'assurer d'avoir la dernière version compilée
npm run build

# Récupérer la version depuis manifest.json
VERSION=$(grep '"version":' public/manifest.json | cut -d '"' -f 4)
ZIP_NAME="BetterScoDoc-v$VERSION.zip"
RELEASE_DIR="releases"

# Créer le dossier releases s'il n'existe pas
mkdir -p $RELEASE_DIR

# Supprimer l'ancien zip s'il existe dans le dossier (optionnel, ou on garde l'historique)
if [ -f "$RELEASE_DIR/$ZIP_NAME" ]; then
    rm "$RELEASE_DIR/$ZIP_NAME"
fi

echo "🏷️  Version détectée : $VERSION"

cd dist
zip -r "../$RELEASE_DIR/$ZIP_NAME" *
cd ..

echo "✅ $ZIP_NAME créé avec succès dans le dossier $RELEASE_DIR/ !"
