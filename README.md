# Bomoi — Site officiel

Site Next.js/React exporté en fichiers statiques et servi directement par IIS.

## Développement

Node.js compatible avec `package.json` est utilisé sur le poste de développement
et pour la compilation.

```bash
npm ci
npm run dev
```

## Construction et publication

```bash
npm run build
```

Le dossier `out` contient les pages HTML, les ressources, les PDF et le
`web.config` pour IIS. Les visiteurs accèdent aux fichiers servis par IIS.
Les commandes `build:iis` et `package:iis` restent disponibles pour les scripts
existants. La compilation utilise `.iis-export` comme export intermédiaire,
puis copie les fichiers dans `out` en conservant son répertoire racine.

Le push est réalisé par l’utilisateur, puis le pull et le build manuels sur le VPS.
Voir [README-IIS.md](README-IIS.md) pour la première bascule et les mises à jour.

```bash
npm test
```

Les tests vérifient les fichiers exportés, les pages et le paquet IIS.
Les guides partagent les JSON de `app/manual`, leur composant et les PDF.
Voir [scripts/README-manuel.md](scripts/README-manuel.md) et
[scripts/README-telechargements.md](scripts/README-telechargements.md).

Les formulaires de contact et de démonstration conservent leur état de démonstration.
Un service d’envoi dédié pourra être raccordé pour traiter leurs messages.

Les fichiers du starter Sites/Cloudflare restent une cible historique distincte.
La publication du site officiel s’effectue sur le VPS IIS.
