/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */
"use client";
import type { DownloadApplication } from "./statistics";

const applications = [
  { id: "bomoi-pos", manual: "pos", name: "Bomoi Sales Mobile / Stock POS", description: "Ventes, encaissements, reçus et synchronisation pour vos équipes commerciales." },
  { id: "bomoi-exchange-pos", manual: "exchange-pos", name: "Bomoi Exchange POS", description: "Achats et ventes de devises, reçus et opérations hors ligne pour les agents de change." },
  { id: "bomoi-stock-client", manual: "stock-client", name: "Bomoi Stock Client", description: "Commandes, livraisons, paiements et relevés personnels de vos clients." },
] satisfies { id: DownloadApplication; manual: string; name: string; description: string }[];

export function MobileDownloadsHub() {
  return <main className="pos-downloads download-hub notranslate" lang="fr" translate="no">
    <section className="download-hero">
      <img src="/bomoi-logo.png" alt="Bomoi" width="76" height="76"/>
      <span className="eyebrow">APPLICATIONS ANDROID</span>
      <h1>Les applications Bomoi.<br/><span>Leurs guides, au même endroit.</span></h1>
      <p>Retrouvez les applications Bomoi et leurs manuels. Les liens Google Play seront ajoutés après leur publication.</p>
    </section>
    <section className="download-options" aria-label="Applications Android Bomoi">
      {applications.map(app => <article key={app.id} className="download-option unavailable">
        <span className="version">Google Play · À venir</span>
        <h2>{app.name}</h2>
        <p>{app.description}</p>
        <p><a href={`/telechargements/${app.id}`}>Découvrir l’application</a></p>
        <p><a href={`/documentation/bomoi-${app.manual}`}>Lire le manuel</a></p>
        <a href={`/documentation/bomoi-${app.manual}-manuel-utilisateur.pdf`} download>Télécharger le manuel PDF</a>
      </article>)}
    </section>
  </main>;
}

export function MobileDownloadsPage({ application }: { application: DownloadApplication }) {
  const app = applications.find(item => item.id === application)!;
  return <main className="pos-downloads notranslate" lang="fr" translate="no">
    <section className="download-hero">
      <a href="/telechargements">Toutes les applications</a>
      <img src="/bomoi-logo.png" alt="Bomoi" width="76" height="76"/>
      <span className="eyebrow">APPLICATION ANDROID</span>
      <h1>{app.name}</h1>
      <p>{app.description}</p>
    </section>
    <section className="download-options" aria-label={app.name}>
      <article className="download-option unavailable">
        <span className="version">À venir</span>
        <h2>Google Play Store</h2>
        <p>Le lien sera disponible ici après la publication de l’application sur Google Play.</p>
        <button className="btn secondary" disabled>Google Play — à venir</button>
      </article>
      <article className="download-option available">
        <h2>Manuel utilisateur</h2>
        <p>Consultez les fonctionnalités et les procédures de {app.name}.</p>
        <p><a className="btn secondary" href={`/documentation/bomoi-${app.manual}`}>Consulter le guide</a></p>
        <a href={`/documentation/bomoi-${app.manual}-manuel-utilisateur.pdf`} download>Télécharger le manuel PDF</a>
        {application === "bomoi-stock-client" && <p><a className="text-link" href="/confidentialite/bs-client">Politique de confidentialité de BS Client</a></p>}
      </article>
    </section>
  </main>;
}
