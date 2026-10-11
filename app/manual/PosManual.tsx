/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */
"use client";
import { useState } from "react";
import manual from "./pos-manual.fr.json";
import "./pos-manual.css";
export default function PosManual() {
  const [query, setQuery] = useState("");
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  const sections = manual.sections.filter(section => words.every(word => normalize(JSON.stringify(section)).includes(word)));
  return <main className="pos-manual notranslate" lang="fr" dir="ltr" translate="no">
    <header className="pos-manual-hero">
      <a href="/documentation" className="pos-manual-back">← Centre de documentation</a>
      <div className="pos-manual-brand"><img src="/bomoi-logo.png" width="68" height="68" alt="Bomoi" /><span className="eyebrow">GUIDE D’UTILISATION · ANDROID & IOS</span></div>
      <h1>Votre quotidien avec <span>Bomoi POS.</span></h1>
      <p>Vendre, encaisser, imprimer et travailler hors ligne. Toutes les étapes, les cas particuliers et les solutions aux incidents dans un seul manuel.</p>
      <div className="pos-manual-actions"><a className="btn" href="/documentation/bomoi-pos-manuel-utilisateur.pdf" download>Télécharger le manuel PDF ↓</a><span>Français · Édition du {manual.edition} · {manual.sections.length} chapitres</span></div>
      <div className="pos-manual-safety"><strong>Une vente, un seul encaissement.</strong> Si l’impression ou la synchronisation échoue, retrouvez d’abord l’opération dans Historique. Conservez les données de l’appareil.</div>
    </header>
    <div className="pos-manual-layout">
      <aside className="pos-manual-sidebar" aria-label="Sommaire du manuel">
        <label htmlFor="pos-manual-search">Rechercher une action ou un problème</label>
        <input id="pos-manual-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex. reçu, stock insuffisant…" />
        <p role="status">{sections.length} chapitre(s)</p>
        <nav>{sections.map(section => <a key={section.id} href={`#${section.id}`}><span>{String(manual.sections.indexOf(section) + 1).padStart(2, "0")}</span>{section.title}</a>)}</nav>
        <a className="pos-manual-support" href="mailto:contact@bomoi.cd">Besoin d’aide ? contact@bomoi.cd</a>
      </aside>
      <div className="pos-manual-content">
        {sections.length === 0 && <div className="pos-manual-chapter"><h2>Aucun résultat</h2><p>Essayez un mot plus court comme « reçu », « caisse » ou « connexion ».</p><button className="btn secondary" onClick={() => setQuery("")}>Afficher tout le manuel</button></div>}
        {sections.map(section => <article className="pos-manual-chapter" id={section.id} key={section.id}>
          <span className="pos-manual-chapter-number">CHAPITRE {String(manual.sections.indexOf(section) + 1).padStart(2, "0")}</span>
          <h2>{section.title}</h2><p className="pos-manual-intro">{section.intro}</p>
          {section.steps.length > 0 && <><h3>Comment faire</h3><ol>{section.steps.map(step => <li key={step}>{step}</li>)}</ol></>}
          {section.notes.length > 0 && <div className="pos-manual-notes"><h3>À retenir</h3>{section.notes.map(note => <p key={note}>{note}</p>)}</div>}
          {section.issues.length > 0 && <><h3>Situations et solutions</h3>{section.issues.map(issue => <details key={issue.problem} open={words.length > 0 ? true : undefined}><summary>{issue.problem}</summary><p>{issue.action}</p></details>)}</>}
        </article>)}
        <footer className="pos-manual-end"><h2>Bomoi vous accompagne.</h2><p>ERP moderne · Multisite · Gestion intégrée</p><p>Kinshasa, République démocratique du Congo</p><div><a href="mailto:contact@bomoi.cd">contact@bomoi.cd</a><a href="tel:+243981863765">+243 981 863 765</a></div><a className="btn" href="/documentation/bomoi-pos-manuel-utilisateur.pdf" download>Conserver le manuel en PDF ↓</a></footer>
      </div>
    </div>
  </main>;
}
