# Bomoi sur IIS en site statique

Décision du 26 novembre 2026. Le site produit un fichier HTML par page et les
ressources nécessaires. IIS sert directement le contenu de `out`.

## Première bascule depuis la version Node

1. Faire le push des sources locales, puis le pull dans le dépôt du site sur le VPS.
2. Arrêter le service Node dédié au site Bomoi et désactiver son démarrage automatique.
3. Dans IIS, arrêter le site Bomoi pendant cette première bascule.
4. Depuis `C:\Bomoi\sites\bomoi-site-officiel`, exécuter les commandes suivantes.

```powershell
git pull
npm ci
npm run build
Test-Path .\out\index.html
Test-Path .\out\web.config
```

Les deux vérifications doivent afficher `True`.
Faire pointer le chemin physique du site IIS vers
`C:\Bomoi\sites\bomoi-site-officiel\out`, puis démarrer le site dans IIS.

Le nouveau `web.config` sert `index.html` comme document par défaut et fournit la
page 404 pour les URL inconnues. Les liens des guides possèdent chacun leur dossier
et leur `index.html`. Le domaine et le certificat HTTPS restent gérés dans IIS.

Si une ancienne règle de proxy vers `127.0.0.1:3080` a été ajoutée manuellement
dans IIS au niveau du site ou du serveur, retirer cette règle pour le site Bomoi.
Le `web.config` livré remplace la règle de proxy précédemment incluse dans `out`.

## Mises à jour suivantes

Dans le dépôt du site sur le VPS, exécuter les commandes suivantes.

```powershell
git pull
npm ci
npm run build
```

`npm run build` effectue le contrôle TypeScript, génère les pages dans
`.iis-export`, puis synchronise leur contenu dans `out`. Cette synchronisation
conserve le répertoire racine `out` et retire les anciens fichiers générés,
y compris ceux du paquet serveur précédent.

Le compte qui lance la compilation doit pouvoir écrire dans ces répertoires.
Pour éviter qu’un visiteur consulte une page pendant son remplacement, arrêter
le site IIS le temps de la copie ou effectuer la mise à jour pendant une fenêtre
de maintenance. Une sauvegarde de la version précédente permet un retour arrière.

`npm run build:iis` génère l’export intermédiaire.
`node scripts/package-iis.mjs` synchronise cet export dans `out`.
`npm run package:iis` réalise les deux étapes, comme `npm run build`.

## Vérifications après publication

- L’accueil et les pages de présentation répondent sur `https://bomoi.cd/`.
- Un lien de chapitre ouvert directement ou rechargé conserve la bonne page.
- Les anciens liens `/documentation/bomoi-erp/` affichent les guides Stock.
- Les manuels PDF restent accessibles dans `/documentation/`.
- `/confidentialite/bs-client/` et `/conditions-utilisation/bs-client/` sont accessibles.
- Une URL inconnue reçoit un HTTP 404.
- Les ressources `/_next/static/` se chargent correctement.

## Données historiques et formulaires

Les API de compteurs sont retirées de cette version. Les anciennes bases SQLite
placées hors du checkout et hors de `out` peuvent être conservées comme archives.
Le site statique ne les utilise plus.

Les formulaires de contact et de démonstration restent des démonstrations.
Le traitement réel de leurs messages nécessite un service d’envoi dédié.

Références techniques. [Export statique Next.js](https://nextjs.org/docs/app/guides/static-exports)
et [document par défaut IIS](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/defaultdocument/).
