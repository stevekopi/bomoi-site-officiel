# Déployer Bomoi dans IIS

Le dépôt produit automatiquement une archive statique prête pour IIS après chaque mise à jour de la branche `main`.

## Télécharger la version prête à publier

1. Ouvrir l’onglet **Actions** du dépôt GitHub.
2. Ouvrir la dernière exécution **Construire la version IIS** terminée avec succès.
3. Télécharger l’artefact **bomoi-site-iis**.
4. Décompresser l’archive.
5. Copier son contenu dans le dossier physique du site IIS.

Le fichier `web.config` est déjà inclus. Cette version ne nécessite ni Node.js, ni reverse proxy sur le serveur IIS.

## Mise à jour

Avant de remplacer les fichiers en production, conserver une copie du dossier actuellement publié. Copier ensuite l’intégralité du nouvel artefact dans le dossier IIS et recycler le pool d’applications si nécessaire.
