# Déployer Bomoi dans IIS

Le dépôt contient le code source du site. La construction de la version IIS est lancée manuellement sur la machine utilisée pour le déploiement.

## Construire la version prête à publier

1. Récupérer la dernière version du code source depuis GitHub.
2. Installer Node.js 22 ou une version compatible.
3. Dans le dossier du projet, exécuter `npm ci`.
4. Exécuter `npm run package:iis`.
5. Copier le contenu du dossier `out` dans le dossier physique du site IIS.

Le fichier `web.config` est déjà inclus. Cette version ne nécessite ni Node.js, ni reverse proxy sur le serveur IIS.

## Mise à jour

Avant de remplacer les fichiers en production, conserver une copie du dossier actuellement publié. Copier ensuite l’intégralité du dossier `out` dans le dossier IIS et recycler le pool d’applications si nécessaire.
