# BetterScoDoc 🎓

**BetterScoDoc** est une extension de navigateur qui transforme et modernise complètement l'interface de ScoDoc (logiciel de gestion de scolarité). Elle offre un design épuré, moderne et réactif pour une meilleure expérience utilisateur.

## ✨ Fonctionnalités

*   **Interface Moderne** : Un design repensé avec une esthétique "Glassmorphism", des cartes épurées et des animations fluides.
*   **Thèmes Sombre & Clair** : Support natif du mode sombre (par défaut) et d'un mode clair élégant, avec bascule facile.
*   **Tableau de Bord Amélioré** :
    *   Visualisation claire des moyennes et des rangs.
    *   Statistiques d'absences en un coup d'œil.
    *   Cartes colorées pour les UEs et les Ressources.
    *   Graphiques de répartition des notes (histogrammes).
*   **Navigation Fluide** : Barre latérale intuitive pour accéder rapidement aux notes, absences et profil.
*   **Détails des Notes** : Cliquez sur n'importe quelle évaluation pour voir le détail, le coefficient, et la position par rapport à la promo.
*   **Calcul de Moyenne** : Affichage clair des moyennes par UE et par Ressource.

## 🚀 Installation

Cette extension n'est pas encore disponible sur le Chrome Web Store. Vous devez l'installer manuellement (mode développeur).

1.  Allez dans les [Releases](https://github.com/votre-pseudo/BetterScoDoc/releases) et téléchargez le fichier `BetterScoDoc.zip` de la dernière version.
2.  Décompressez l'archive `BetterScoDoc.zip`.
3.  Ouvrez Chrome (ou un navigateur basé sur Chromium comme Brave, Edge).
4.  Allez à l'adresse `chrome://extensions`.
5.  Activez le **Mode développeur** (en haut à droite).
6.  Cliquez sur **Charger l'extension non empaquetée** (Load unpacked).
7.  Sélectionnez le dossier décompressé (qui contient `manifest.json`).
8.  Rendez-vous sur votre ENT ScoDoc !

## 🛠️ Développement

Pour contribuer ou modifier l'extension :

1.  **Cloner le dépôt** :
    ```bash
    git clone https://github.com/votre-pseudo/BetterScoDoc.git
    cd BetterScoDoc
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement** (pour tester l'UI hors extension) :
    ```bash
    npm run dev
    ```

4.  **Construire l'extension** (build production) :
    ```bash
    npm run build
    ```
    Le dossier `dist/` contiendra l'extension compilée prête à être chargée.

5.  **Empaqueter le ZIP** :
    ```bash
    ./package.sh
    ```

## 💻 Technologies

*   [React](https://reactjs.org/) - Bibliothèque UI
*   [Vite](https://vitejs.dev/) - Build tool rapide
*   CSS3 (Variables, Flexbox, Grid) - Styles personnalisés sans framework lourd

## 📄 Licence

Ce projet est sous licence MIT. Libre à vous de l'utiliser et de le modifier.
