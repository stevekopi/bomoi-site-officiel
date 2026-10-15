# Manuels utilisateurs du site officiel

Le centre `/documentation` présente Bomoi Stock, Bomoi Exchange, Bomoi POS et l’espace Bomoi School à venir. Le contenu de chaque manuel publié est partagé entre les pages et le PDF :

- `app/manual/stock-manual.fr.json` : ancien contenu ERP, conservé sous Bomoi Stock (13 chapitres).
- `app/manual/exchange-manual.fr.json` : bureau de change (21 chapitres).
- `app/manual/pos-manual.fr.json` : manuel POS existant (20 chapitres).

`app/manual/catalog.ts` centralise les produits, leurs métadonnées et les routes. Chaque chapitre possède une page autonome `/documentation/bomoi-{produit}/{id}`. La recherche du centre et celle des manuels utilisent les mêmes contenus. School reste une page de préparation sans fonctionnalité ni date de sortie annoncée ; ne pas afficher un téléchargement de manuel inexistant.

Après une correction de contenu, régénérer le PDF correspondant :

```sh
python3 scripts/generate-pos-manual.py --product stock
python3 scripts/generate-pos-manual.py --product exchange
python3 scripts/generate-pos-manual.py --product pos
```

ReportLab est requis. Les fichiers finaux sont dans `public/documentation/`. Le générateur Stock met aussi à jour l’ancienne URL PDF ERP pour préserver les téléchargements existants. `--product erp` reste un alias compatible de `stock`. Les anciennes pages `/documentation/bomoi-erp` et leurs chapitres restent lisibles avec une URL canonique Stock et des liens internes Stock.

Vérifier les PDF visuellement et les liens avant publication. Ne jamais inclure de secrets, de serveurs privés, de procédures de développement ou de migrations dans les guides utilisateurs. Exchange doit documenter les comportements disponibles dans le code ; conserver la distinction entre quantité physique, valeur CDF, résultats réalisés et réévaluations, et ne pas annoncer un mode hors ligne ou des commissions automatiques indisponibles.

Validation : `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.iis.json`, puis la construction du site et `node --test tests/rendered-html.test.mjs`. La version IIS se construit avec `npm run package:iis` sur le poste de publication ; les sources Sites conservent leur mécanisme de publication existant.
