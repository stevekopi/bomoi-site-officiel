# Applications mobiles Bomoi

Le centre `/telechargements/` présente les applications et leurs guides.
Les pages `/telechargements/bomoi-pos/`,
`/telechargements/bomoi-exchange-pos/` et
`/telechargements/bomoi-stock-client/` sont conservées.

Depuis le 26 novembre 2026, les téléchargements APK, leurs métadonnées,
leurs boutons et leur restauration au build sont retirés du site.
Les liens Google Play seront ajoutés lorsque les applications seront publiées.
Les pages indiquent actuellement « Google Play — à venir ».

Les guides web et les manuels PDF restent accessibles.
La politique de confidentialité de BS Client est disponible à
`/confidentialite/bs-client/` après le déploiement du site.

`npm run build` prépare le site statique dans `out`, servi directement par IIS.
La publication suit le push utilisateur, puis le pull et le build sur le VPS,
selon [README-IIS.md](../README-IIS.md).

Les API de compteurs sont retirées du site statique. Les bases historiques
conservées hors du site peuvent être archivées.
