# Bomoi sur IIS avec son propre serveur Node.js

Décision du 21 octobre 2026 : le site officiel utilise son serveur Next.js/Node.js.
Les pages, les APK, les PDF et les compteurs sont servis par le site Bomoi lui-même.
Aucun appel au Gateway ERP n’est nécessaire pour les compteurs. Les ajouts de
compteur précédemment proposés dans ERP.Gateway ont été retirés.

## Préparation sur le VPS

- Node.js compatible avec `package.json` (22.13 minimum), Git et npm.
- IIS avec URL Rewrite et Application Request Routing (ARR), option **Enable Proxy**
  activée. Cette configuration IIS est nécessaire une fois pour relayer le site
  vers `http://127.0.0.1:3080`. Elle ne concerne pas le Gateway ERP.
- Un processus Node permanent pour le site, géré par le superviseur/service Windows
  déjà utilisé sur le VPS, avec redémarrage automatique. Avoir Node installé ne
  lance pas le serveur ; fermer une session PowerShell ne doit pas arrêter le site.

Le fichier `iis/web.config`, inclus dans `out`, relaie toutes les requêtes vers
le serveur local du site. Le port Node écoute uniquement sur la boucle locale.
Le domaine et le certificat HTTPS restent configurés dans IIS comme auparavant.
Ne pas exposer les fichiers du checkout ou de `out` comme téléchargements statiques :
la règle de proxy transmet aussi `/api/downloads/` au serveur du site.

Références : [Next.js standalone](https://nextjs.org/docs/app/api-reference/config/next-config-js/output),
[IIS ARR et URL Rewrite](https://learn.microsoft.com/en-us/iis/extensions/url-rewrite-module/reverse-proxy-with-url-rewrite-v2-and-application-request-routing).

## Pull et build manuels sur le VPS

L’utilisateur fait lui-même le push des sources locales. Sur le VPS, dans le dépôt
**du site officiel uniquement** :

```powershell
git pull
npm ci
npm run package:iis
```

`npm run build` est désormais un alias de ce build Node/IIS. Il restaure et vérifie
les APK, contrôle TypeScript, compile Next.js et prépare `out` avec `server.js`,
les dépendances nécessaires, `public`, `.next/static` et `web.config`.
**`out` n’est plus un export HTML utilisable seul : son serveur Node doit tourner.**

Lors de la première bascule, faire pointer le répertoire physique IIS du site vers
`out` et configurer le superviseur Node. Depuis la racine du dépôt, son démarrage est :

```powershell
npm run start:iis
```

Le script exécute `out/server.js` en production sur `127.0.0.1:3080` ; `npm start`
fait la même chose. Le service doit employer le compte Windows et le répertoire de
travail appropriés. Un hébergement à partir d’une copie complète de `out` peut
lancer directement `node server.js` depuis cette copie, avec `HOSTNAME=127.0.0.1`
et `PORT=3080` dans l’environnement du processus.

Arrêter le processus Node du site avant de remplacer son dossier actif, puis le
redémarrer après le build. Pour réduire cette interruption, lancer d’abord
`npm run build:iis`, puis arrêter le service, exécuter `node scripts/package-iis.mjs`
et redémarrer le service. Conserver une sauvegarde du déploiement précédent.
Ne pas arrêter les services ERP pour mettre à jour ce site.

Si le port est changé avec `BOMOI_SITE_PORT`, adapter aussi la cible du proxy dans
`iis/web.config`. Ne pas servir le site en double sur plusieurs ports par erreur.
Le footer conserve la version Git et la date de construction de cette cible.

## Données persistantes des compteurs

Le site utilise SQLite intégré à Node.js : aucun serveur de base de données,
compte externe, module ERP ou package de pilote additionnel.
Les totaux sont stockés dans `downloads.sqlite` et ses éventuels fichiers `-wal`
/ `-shm`. Ils restent indépendants des mises à jour et des versions des APK.

Dans l’environnement du **service Node du site**, définir par exemple :

```powershell
$env:BOMOI_DOWNLOAD_DATA_DIR = "C:\Bomoi\data\site-download-statistics"
```

Une affectation dans un terminal ne configure que les processus lancés depuis ce
terminal : enregistrer cette variable dans le superviseur/service pour les
redémarrages. Préparer le dossier et accorder Modification au compte qui exécute
**Node**, pas à un service ERP. Garder ce dossier hors checkout, hors `out` et hors
contenu web public. Ne jamais le nettoyer pendant un pull ou un build.

Sans surcharge, Windows utilise `%ProgramData%\BomoiSite\DownloadStatistics`.
Le module SQLite est disponible dans Node 22.13 ; cette version peut émettre son
avertissement expérimental. Le build et les tests locaux utilisent Node 24.
[Documentation Node 22.13](https://nodejs.org/download/release/v22.13.0/docs/api/sqlite.html).

Sauvegarder le dossier après arrêt du service Node pour conserver une sauvegarde
cohérente, y compris les journaux SQLite. Ne pas copier seulement le fichier
principal pendant une écriture. Une suppression du dossier perdrait les totaux.
Ne pas partager ce SQLite sur un lecteur réseau ; plusieurs processus sur le même
disque local utilisent les transactions SQLite. Une ferme multi-VPS nécessite
une autre stratégie, hors du déploiement actuel sur un VPS.

## Vérifications après redémarrage

- Le site et les deux pages de téléchargement répondent sur `https://bomoi.cd`.
- `GET /api/downloads/` retourne les deux totaux et `Cache-Control: no-store`.
- Un téléchargement depuis un bouton actualise le bon total ; un second navigateur
  lit ce même total. Un téléchargement direct d’un APK ne remplace pas ce test.
- Les PDF et les APK restent accessibles, y compris leurs reprises HTTP partielles.
- Les totaux restent identiques après redémarrage du service Node du site.

Un compteur en panne affiche une indisponibilité ou sa dernière valeur connue,
sans empêcher le téléchargement. Aucun historique antérieur n’est reconstitué.
Le build local et les tests ne prouvent ni configuration IIS réelle ni publication.
