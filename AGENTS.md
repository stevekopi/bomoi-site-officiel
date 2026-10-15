# Documentation du site officiel Bomoi

Avant de modifier les guides, lire `scripts/README-manuel.md`. Réutiliser `app/manual/catalog.ts`, le composant de manuel et les JSON communs au site/PDF ; ne pas dupliquer les chapitres dans des pages indépendantes.

- Bomoi Stock reprend les 13 chapitres anciennement Bomoi ERP. Conserver les pages `/documentation/bomoi-erp` et leurs chapitres avec une URL canonique Stock, ainsi que l’ancien téléchargement PDF.
- Bomoi Exchange possède 21 chapitres utilisateurs. Recouper les procédures avec les écrans/services actuels du dépôt ERP avant de les enrichir. Les achats/ventes calculent une cotation puis sont enregistrés par la confirmation ; leurs caisses viennent des affectations du poste. Ne pas inventer de brouillon métier, de saisie libre du taux ou de sélection de caisse absente du formulaire.
- Préserver les 20 chapitres Bomoi POS. Bomoi School reste un espace explicitement à venir, sans fonctionnalité, date de disponibilité ni PDF fictifs.
- Les guides publics ne contiennent ni secrets, ni adresses de serveurs privés, ni instructions de migration ou de développement. Distinguer les quantités physiques, valeurs CDF, résultats réalisés et réévaluations. Ne pas annoncer des commissions automatiques ou du change hors ligne indisponibles.
- Après modification d’un JSON, régénérer le PDF correspondant et vérifier son rendu. Vérifier aussi recherche, navigation, métadonnées, liens historiques et pages inconnues.
- Les sources servent Sites et l’export statique IIS. Respecter la cible effective ; un build IIS réussi n’est pas une publication sur le VPS. Les consignes de construction sont dans `README-IIS.md` et les scripts existants.
