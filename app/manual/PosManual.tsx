/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */
"use client";
import { useState } from "react";
import posManual from "./pos-manual.fr.json";
import erpManual from "./erp-manual.fr.json";
import "./pos-manual.css";
export default function PosManual({ chapterId, product = "pos" }: { chapterId?: string; product?: "pos" | "erp" }) {
  const isPos = product === "pos";
  const manual = isPos ? posManual : erpManual;
  const manualUrl = `/documentation/bomoi-${product}`;
  const productName = isPos ? "Bomoi POS" : "Bomoi ERP";
  const pdfUrl = `/documentation/bomoi-${product}-manuel-utilisateur.pdf`;
  const chapterIndex = manual.sections.findIndex(section => section.id === chapterId);
  const chapter = manual.sections[chapterIndex];
  const previous = manual.sections[chapterIndex - 1];
  const next = manual.sections[chapterIndex + 1];
  const [query, setQuery] = useState("");
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  const sections = manual.sections.filter(section => words.every(word => normalize(JSON.stringify(section)).includes(word)));
  return <main className="pos-manual notranslate" lang="fr" dir="ltr" translate="no">
    {chapter ? <header className="pos-manual-chapter-header">
      <a href={manualUrl} className="pos-manual-back">← Manuel utilisateur {productName}</a>
      <p>Français · Édition du {manual.edition}</p>
      <a className="btn btn-small secondary" href={pdfUrl} download>Télécharger le manuel complet PDF ↓</a>
    </header> : <header className="pos-manual-hero">
      <a href="/documentation" className="pos-manual-back">← Centre de documentation</a>
      <div className="pos-manual-brand"><img src="/bomoi-logo.png" width="68" height="68" alt="Bomoi" /><span className="eyebrow">GUIDE D’UTILISATION · {isPos ? "ANDROID & IOS" : "APPLICATION WEB"}</span></div>
      <h1>Votre quotidien avec <span>{productName}.</span></h1>
      <p>{isPos ? "Vendre, encaisser, imprimer et travailler hors ligne. Toutes les étapes, les cas particuliers et les solutions aux incidents dans un seul manuel." : "Retrouvez les guides du logiciel web : stocks, ventes, achats, caisses, rapports et traitement des conflits POS."}</p>
      <div className="pos-manual-actions"><a className="btn" href={pdfUrl} download>Télécharger le manuel PDF ↓</a><span>Français · Édition du {manual.edition} · {manual.sections.length} chapitres</span></div>
      <div className="pos-manual-safety"><strong>Une vente, un seul encaissement.</strong> {isPos ? "Si l’impression ou la synchronisation échoue, retrouvez d’abord l’opération dans Historique. Conservez les données de l’appareil." : "Avant de ressaisir une opération après une erreur, vérifiez sa présence dans la liste et consultez son état."}</div>
    </header>}
    <div className="pos-manual-layout">
      <aside className="pos-manual-sidebar" aria-label="Sommaire du manuel">
        <label htmlFor="pos-manual-search">Rechercher une action ou un problème</label>
        <input id="pos-manual-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex. reçu, stock insuffisant…" />
        <p role="status">{sections.length} chapitre(s)</p>
        <nav>{sections.map(section => <a key={section.id} href={`${manualUrl}/${section.id}`} aria-current={section.id === chapterId ? "page" : undefined}><span>{String(manual.sections.indexOf(section) + 1).padStart(2, "0")}</span>{section.title}</a>)}</nav>
        <a className="pos-manual-support" href="mailto:contact@bomoi.cd">Besoin d’aide ? contact@bomoi.cd</a>
      </aside>
      <div className="pos-manual-content">
        {chapter ? <>
          <article className="pos-manual-chapter" key={chapter.id}>
            <span className="pos-manual-chapter-number">CHAPITRE {String(chapterIndex + 1).padStart(2, "0")}</span>
            <h1>{chapter.title}</h1><p className="pos-manual-intro">{chapter.intro}</p>
            {chapter.steps.length > 0 && <><h2>Comment faire</h2><ol>{chapter.steps.map(step => <li key={step}>{step}</li>)}</ol></>}
            {chapter.notes.length > 0 && <div className="pos-manual-notes"><h2>À retenir</h2>{chapter.notes.map(note => <p key={note}>{note}</p>)}</div>}
            {chapter.issues.length > 0 && <><h2>Situations et solutions</h2>{chapter.issues.map(issue => <details key={issue.problem}><summary>{issue.problem}</summary><p>{issue.action}</p></details>)}</>}
          </article>
          <nav className="pos-manual-pagination" aria-label="Navigation entre les chapitres">
            {previous ? <a href={`${manualUrl}/${previous.id}`}><small>← Précédent</small><strong>{previous.title}</strong></a> : <a href={manualUrl}><small>← Accueil</small><strong>Sommaire du manuel</strong></a>}
            {next && <a href={`${manualUrl}/${next.id}`}><small>Suivant →</small><strong>{next.title}</strong></a>}
          </nav>
        </> : <>
          {sections.length === 0 && <div className="pos-manual-chapter"><h2>Aucun résultat</h2><p>Essayez un mot plus court comme « reçu », « caisse » ou « connexion ».</p><button className="btn secondary" onClick={() => setQuery("")}>Afficher tout le manuel</button></div>}
          <div className="pos-manual-cards">{sections.map(section => <a className="pos-manual-card" href={`${manualUrl}/${section.id}`} key={section.id}>
            <span className="pos-manual-chapter-number">CHAPITRE {String(manual.sections.indexOf(section) + 1).padStart(2, "0")}</span>
            <h2>{section.title}</h2><p>{section.intro}</p><strong>Lire le chapitre →</strong>
          </a>)}</div>
        </>}
        <footer className="pos-manual-end"><h2>Bomoi vous accompagne.</h2><p>ERP moderne · Multisite · Gestion intégrée</p><p>Kinshasa, République démocratique du Congo</p><div><a href="mailto:contact@bomoi.cd">contact@bomoi.cd</a><a href="tel:+243981863765">+243 981 863 765</a></div><a className="btn" href={pdfUrl} download>Conserver le manuel en PDF ↓</a></footer>
      </div>
    </div>
  </main>;
}
