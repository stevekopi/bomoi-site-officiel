/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */
"use client";
import pos from "../pos-release.json";
import exchange from "../exchange-pos-release.json";
import client from "../stock-client-release.json";
import DownloadActions from "./DownloadActions";
import type { DownloadApplication } from "./statistics";

const applications = [
  { id: "bomoi-pos", manual: "pos", name: "Bomoi Sales Mobile / Stock POS", description: "Ventes, encaissements, reçus et synchronisation pour vos équipes commerciales.", release: pos },
  { id: "bomoi-exchange-pos", manual: "exchange-pos", name: "Bomoi Exchange POS", description: "Achats et ventes de devises, reçus et opérations hors ligne pour les agents de change.", release: exchange },
  { id: "bomoi-stock-client", manual: "stock-client", name: "Bomoi Stock Client", description: "Commandes, livraisons, paiements et relevés personnels de vos clients.", release: client },
] satisfies { id: DownloadApplication; manual: string; name: string; description: string; release: typeof pos }[];

export function MobileDownloadsHub() {
  return <main className="pos-downloads download-hub notranslate" lang="fr" translate="no">
    <section className="download-hero"><img src="/bomoi-logo.png" alt="Bomoi" width="76" height="76"/><span className="eyebrow">APPLICATIONS ANDROID</span><h1>Les applications Bomoi.<br/><span>Leurs guides, au même endroit.</span></h1><p>Choisissez votre application et téléchargez sa dernière version APK avec son manuel utilisateur. Les APK fonctionnent sans Expo Go.</p></section>
    <section className="download-options" aria-label="Applications Android disponibles">
      {applications.map(app => <article key={app.id} className="download-option available">
        <span className="download-platform" aria-hidden="true">↓</span><span className="version">Version {app.release.version}</span><h2>{app.name}</h2><p>{app.description}</p>
        <DownloadActions application={app.id} source={app.release.path} path={app.release.path} label="Télécharger l’APK Android ↓"/>
        <small>{Math.ceil(app.release.bytes / 1_000_000)} Mo · {app.release.date} · APK signé</small>
        <p><a href={`/telechargements/${app.id}`}>Installation et informations →</a></p>
        <p><a href={`/documentation/bomoi-${app.manual}`}>Lire le manuel →</a></p>
        <a href={`/documentation/bomoi-${app.manual}-manuel-utilisateur.pdf`} download>Télécharger le manuel PDF ↓</a>
        <details><summary>Empreinte SHA-256</summary><code>{app.release.sha256}</code></details>
      </article>)}
    </section>
    <section className="download-instructions"><div><h2>Mettre à jour en conservant ses données.</h2><p>Installez l’APK officiel par-dessus l’application existante. Synchronisez ou faites traiter les opérations en attente avant de changer d’appareil ou de supprimer des données.</p></div><aside><h3>Android uniquement</h3><p>Les fichiers APK s’installent sur les appareils Android compatibles. Les téléchargements Google Play et App Store ne sont pas encore proposés.</p><a href="/documentation">Consulter toutes les documentations →</a></aside></section>
  </main>;
}

export function ExchangeDownloadsPage() {
  return <main className="pos-downloads notranslate" lang="fr" translate="no">
    <section className="download-hero"><a href="/telechargements">← Toutes les applications</a><img src="/bomoi-logo.png" alt="Bomoi" width="76" height="76"/><span className="eyebrow">TÉLÉCHARGEMENTS · BOMOI EXCHANGE POS</span><h1>Votre bureau de change.<br/><span>Avec vous, sur le terrain.</span></h1><p>Enregistrez vos achats et ventes de devises, imprimez les reçus et retrouvez vos opérations en attente de synchronisation.</p></section>
    <section className="download-options" aria-label="Télécharger Bomoi Exchange POS">
      <article className="download-option available"><span className="download-platform" aria-hidden="true">↓</span><span className="version">Disponible maintenant</span><h2>APK Android</h2><p>Application autonome pour les agents disposant d’un compte et d’un site autorisés dans Exchange.</p><DownloadActions application="bomoi-exchange-pos" source={exchange.path} path={exchange.path} label="Télécharger Exchange POS Android ↓"/><small>Version {exchange.version} · {Math.ceil(exchange.bytes / 1_000_000)} Mo · Android {exchange.minimumAndroid} ou ultérieur</small><small>APK signé · {exchange.date} · Sans Expo Go</small></article>
      <article className="download-option unavailable"><span className="download-platform" aria-hidden="true">▷</span><span className="version">Indisponible</span><h2>Google Play Store</h2><p>Utilisez l’APK officiel ; cette application n’est pas encore publiée sur Google Play.</p><button className="btn secondary" disabled>Play Store — indisponible</button></article>
      <article className="download-option unavailable"><span className="download-platform" aria-hidden="true">⌘</span><span className="version">Indisponible</span><h2>iPhone / App Store</h2><p>Le fichier APK concerne uniquement Android. Aucun téléchargement iPhone n’est proposé ici.</p><button className="btn secondary" disabled>App Store — indisponible</button></article>
    </section>
    <section className="download-instructions"><div><span className="eyebrow">INSTALLATION ANDROID</span><h2>Préparez votre appareil avant le départ.</h2><ol><li>Téléchargez l’APK, attendez la fin puis ouvrez le fichier.</li><li>Autorisez cette source à installer l’application si Android le demande.</li><li>Connectez-vous en ligne avec votre compte Exchange et choisissez votre site.</li><li>Dans Paramètres, téléchargez les dernières données et vérifiez la journée et les taux.</li></ol><p><a className="btn secondary" href="/documentation/bomoi-exchange-pos">Consulter le manuel utilisateur →</a></p><a href="/documentation/bomoi-exchange-pos-manuel-utilisateur.pdf" download>Télécharger le manuel PDF ↓</a></div><aside><h3>Une opération, un seul échange de fonds.</h3><p>Après préparation en ligne, les opérations peuvent être enregistrées hors ligne sur l’appareil. Leur envoi reste soumis aux contrôles serveur. Un conflit conserve son identifiant, ses montants et ses instructions dans Historique.</p><p>Une impression manquée ou une réponse réseau perdue ne justifie pas une seconde opération. Conservez les données locales jusqu’à synchronisation ou traitement avec votre responsable.</p><details><summary>Vérifier le fichier téléchargé</summary><p>Empreinte SHA-256 :</p><code>{exchange.sha256}</code></details></aside></section>
  </main>;
}
