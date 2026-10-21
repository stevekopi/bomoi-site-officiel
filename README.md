# Bomoi — Site officiel

Site Next.js/React servi par **son propre processus Node.js derrière IIS**.
Les compteurs de téléchargement font partie du site, sans dépendance au Gateway ERP.

## Développement

Node.js compatible avec `package.json` (22.13 minimum) :

```bash
npm ci
npm run dev
```

## Construction et démarrage de production

```bash
npm run build
npm start
```

`build` prépare le paquet serveur `out` ; `start` lance ce serveur en production
sur `127.0.0.1:3080`. `npm run package:iis` et `npm run start:iis` sont les noms
explicites des mêmes opérations pour le workflow IIS.
Le pull et le build sont réalisés manuellement sur le VPS par l’utilisateur,
après son push local. Voir [README-IIS.md](README-IIS.md) pour le proxy IIS,
le processus Node permanent et les données SQLite persistantes hors publication.

```bash
npm test
```

Les tests utilisent le paquet Node réel, ses routes et des compteurs locaux isolés.
Les guides partagent les JSON de `app/manual`, leur composant et les PDF.
Voir [scripts/README-manuel.md](scripts/README-manuel.md) et
[scripts/README-telechargements.md](scripts/README-telechargements.md).

Les fichiers du starter Sites/Cloudflare sont conservés comme historique séparé.
Les commandes `dev:sites`, `build:sites` et `start:sites` ne sont pas le chemin de
déploiement du site officiel ; le stockage SQLite du site cible Node.js et un
fichier local persistant, pas le système de fichiers d’un Worker Cloudflare.
Ne pas publier sur Sites pour mettre à jour le VPS IIS.
