# Téléchargements des applications Bomoi

Centre : `/telechargements/`. Pages : `/telechargements/bomoi-pos/`,
`/telechargements/bomoi-exchange-pos/` et `/telechargements/bomoi-stock-client/`.
Les APK signés sont décrits par `app/pos-release.json` et
`app/exchange-pos-release.json` et `app/stock-client-release.json` : source de téléchargement publique, version, taille, chemin
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
sans remplacer une erreur par zéro. Les liens de chaque application partagent un identifiant aléatoire
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


## Les trois APK courants — 22 octobre 2026

| Application | Version | Fichier Android | Guide web / PDF |
| --- | --- | --- | --- |
| Bomoi Sales Mobile / Stock POS | 1.0.7 (8) | `Bomoi-POS-1.0.7.apk` | `bomoi-pos` |
| Bomoi Exchange POS | 0.2.0 (2) | `Bomoi-Exchange-POS-0.2.0.apk` | `bomoi-exchange-pos` |
| Bomoi Stock Client | 0.1.2 (3) | `Bomoi-Stock-Client-0.1.2.apk` | `bomoi-stock-client` |

Les fichiers courants sont disponibles dans `public/downloads/` et copiés dans
`out/public/downloads/` par le build IIS. Les identités Android, versions, tailles,
empreintes SHA-256 et certificats ont été vérifiés sur les binaires eux-mêmes.
Exchange POS a été compilé en release locale avec une clé dédiée autorisée par
l’utilisateur. Sa clé et ses mots de passe restent uniquement dans le projet
mobile, sous `.signing/`, jamais dans le site, les sources publiques ou l’archive.

Le centre commun relie chaque APK à son manuel en ligne et à son PDF. Le manuel
Exchange POS possède douze chapitres et partage son JSON avec les pages/PDF.
Il décrit l’application mobile, séparément du manuel Exchange web existant.
Les compteurs restent distincts pour les trois applications. La première ouverture
de leur SQLite migre les anciennes contraintes en transaction, sans perdre les
totaux ni les reçus des deux applications déjà présentes. Ne pas supprimer ce SQLite.

### Transfert au VPS

`outputs/Bomoi-Android-2026-10-22.zip` contient seulement les trois APK courants,
les trois PDF et un inventaire vérifiable. Les APK sont exclus de Git : un pull
seul ne peut pas récupérer les versions compilées localement.

1. Faire le push des sources mises à jour, puis le pull dans le projet du site sur le VPS.
2. Copier l’archive sur le VPS et l’extraire **dans la racine du checkout du site** :
   elle place les APK dans `public/downloads/` et les PDF dans `public/documentation/`.
3. Exécuter `npm ci`, puis `npm run package:iis` et redémarrer le service Node
   du site selon `README-IIS.md`. Conserver le répertoire des compteurs.
4. Contrôler `/telechargements/`, les trois pages applicatives, les PDF et l’API
   `/api/downloads/`. Les trois totaux doivent rester indépendants.

Les URL de restauration pour Exchange 0.2.0 et Stock Client 0.1.2 pointent vers le
site officiel ; avant leur première publication, fournir les fichiers via l’archive
plutôt que compter sur une URL qui ne les sert pas encore. Aucun déploiement VPS,
push ou publication en boutique n’est réalisé par la préparation locale.
