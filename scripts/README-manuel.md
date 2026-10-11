# Manuel utilisateur Bomoi POS

Le contenu français est partagé entre le site et le PDF : `app/manual/pos-manual.fr.json`.
La page publique est `/documentation/bomoi-pos`. Le téléchargement est servi depuis
`public/documentation/bomoi-pos-manuel-utilisateur.pdf`.

Après une correction de contenu, régénérer le PDF :

```sh
python3 -m pip install reportlab
python3 scripts/generate-pos-manual.py
```

Le PDF doit être régénéré et vérifié visuellement avant publication. Ne pas y ajouter
de mots de passe, d’adresses de serveurs privés ou de procédures de développement.
La couverture utilise les coordonnées et le logo officiels déjà présents sur le site.
