# Téléchargements Bomoi POS

Page : `/telechargements/bomoi-pos`.
APK public : `/downloads/Bomoi-POS-1.0.0.apk`.
Les boutiques Play Store et App Store restent indisponibles.

`app/pos-release.json` contient la version, le chemin, la taille exacte, l’empreinte SHA-256 et la source de l’APK signé.
Le binaire (environ 130 Mo) est exclu de Git. `npm run prepare:apk` le restaure depuis Expo et vérifie son empreinte avant publication. Cette étape est automatique avec `npm run build:iis` et `npm run package:iis`.

Déployer tout le dossier `out/`, y compris `downloads/`, sur IIS. Le type MIME APK est déclaré dans `iis/web.config`.
Les hébergements limitant la taille des fichiers statiques doivent utiliser un stockage de fichiers adapté pour cet APK.

Pour publier une nouvelle version : mettre à jour les métadonnées, exécuter `npm run prepare:apk`, puis reconstruire et redéployer le site.
