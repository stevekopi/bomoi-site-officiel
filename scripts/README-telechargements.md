# Téléchargements des applications Bomoi

Pages : `/telechargements/bomoi-pos/` et `/telechargements/bomoi-stock-client/`.
Les APK signés sont décrits par `app/pos-release.json` et
`app/stock-client-release.json` : source de téléchargement publique, version, taille, chemin
et empreinte SHA-256. Les boutiques restent explicitement indisponibles.

`npm run prepare:apk` vérifie et restaure les APK courants dans `public/downloads`.
Les binaires sont exclus de Git. Cette restauration est automatique avec
`npm run build`, `npm run build:iis` et `npm run package:iis`. Une nouvelle version
nécessite les nouvelles métadonnées vérifiées, puis un nouveau build du site.
Le lien principal utilise la source décrite dans les métadonnées ; le second est servi par le propre serveur du site. Pour le client 0.1.2 compilé localement, les deux liens utilisent le site officiel.

Le paquet Node `out` contient les binaires dans `out/public/downloads`, les PDF,
les ressources et le serveur. Ce n’est plus un export HTML statique. Le workflow
retenu est : push local par l’utilisateur, puis pull et build manuels sur le VPS.
Voir [README-IIS.md](../README-IIS.md) pour IIS et le démarrage permanent de Node.
Le domaine et les fichiers ne sont pas publiés par le simple succès d’un build local.

## Compteurs intégrés au site

Le composant `DownloadActions` interroge **`/api/downloads/` sur le même site**.
Un POST à `/api/downloads/{application}/` enregistre le lancement depuis un bouton.
Le compteur est commun aux visiteurs, distinct pour chaque application et conservé
entre les versions des APK dans une base SQLite locale gérée par le site Node.
Aucun appel, stockage ou changement ERP.Gateway n’est nécessaire.

La page lit le total au chargement, au focus et toutes les minutes. Une panne
laisse le téléchargement fonctionner et affiche « — » ou le dernier total reçu,
sans remplacer une erreur par zéro. Les deux liens partagent un identifiant aléatoire
pendant trente secondes ; le serveur le déduplique dix minutes, en transaction.
Une lecture seule ou une reprise HTTP de l’APK n’incrémente pas les totaux.

Le serveur accepte seulement les applications connues et un UUID valide, limite le
JSON à 1 Kio et refuse les origines navigateur non autorisées. Le stockage limite
à 300 nouveaux enregistrements par minute pour tout le site (429 au-delà), tout
en acceptant les reprises idempotentes. Cette limite globale et les reçus sont
partagés entre processus Node sur le même disque local ; aucune IP, identité ou
cookie n’est stocké. Les données sont hors contenu web public et hors build.
Une panne disque/une base corrompue retourne 503, sans remise à zéro automatique.

Le nombre représente les lancements depuis les boutons, toutes versions confondues.
Les téléchargements historiques, liens directs hors boutons, transferts terminés
et installations ne sont pas mesurés. Le suivi reste indicatif : blocage réseau ou
anti-traceur peut sous-compter ; un client automatisé peut simuler les demandes.

## Espace client 0.1.1 — 21 octobre 2026

Bomoi Stock Client 0.1.1 (versionCode 2) remplace 0.1.0 dans les liens courants.
Le package Android et le certificat de signature sont conservés. Source Expo,
taille et SHA-256 vérifiés dans app/stock-client-release.json. Le fichier est
préparé dans public/downloads/Bomoi-Stock-Client-0.1.1.apk et dans le paquet IIS.
Build du site et 27 tests réussis ; page et liens vérifiés dans l’aperçu local.
Aucun push Git ni déploiement VPS effectué. Le push reste réalisé par l’utilisateur,
puis pull/build et redémarrage Node sur son VPS, suivant README-IIS.md.

## Espace client 0.1.2 — 21 octobre 2026

APK compilé localement avec EAS preview, versionCode 3 et certificat identique à la 0.1.1. Stockage des historiques sur le téléphone et synchronisation au retour du réseau. Le fichier courant est `public/downloads/Bomoi-Stock-Client-0.1.2.apk` ; sa taille et son SHA-256 sont enregistrés dans `app/stock-client-release.json`.

Cette compilation locale ne possède pas de téléchargement Expo public. La source de téléchargement est donc le site officiel. Avant le premier build de cette version sur le VPS, transférer ce fichier APK dans `public/downloads/` du checkout du site : les APK sont exclus de Git, un pull seul ne récupère pas le nouveau binaire. `npm run package:iis` vérifie le fichier et l’intègre dans `out/public/downloads/`. La restauration depuis l’URL publique fonctionne une fois cette version effectivement publiée. Ne pas supprimer les données persistantes des compteurs.
