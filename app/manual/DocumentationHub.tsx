/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import { useState } from "react";
import { manualCatalog, type ManualProduct } from "./catalog";
import "./pos-manual.css";

export function ManualNavigation({ current }: { current?: ManualProduct | "school" }) {
  return <nav className="manual-products" aria-label="Choisir une documentation">
    {Object.entries(manualCatalog).map(([key, manual]) => <a key={key} href={`/documentation/bomoi-${key}`} aria-current={current === key ? "page" : undefined}>{manual.name}</a>)}
    <a href="/documentation/bomoi-school" aria-current={current === "school" ? "page" : undefined}>Bomoi School <span>À venir</span></a>
  </nav>;
}
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export default function DocumentationHub() {
  const [query, setQuery] = useState("");
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  const products = Object.entries(manualCatalog).map(([product, manual]) => {
    const productMatch = words.every(word => normalize(`${manual.name} ${manual.description}`).includes(word));
    const sections = manual.data.sections.filter(section => words.every(word => normalize(JSON.stringify(section)).includes(word)));
    return { product, manual, sections: productMatch ? manual.data.sections : sections };
  }).filter(({ sections }) => sections.length > 0);
  const showSchool = words.every(word => normalize("Bomoi School école scolaire documentation à venir").includes(word));
  return <main className="pos-manual documentation-hub notranslate" lang="fr" translate="no">
    <header className="pos-manual-hero"><span className="eyebrow">CENTRE DE DOCUMENTATION</span><h1>Un guide pour chaque <span>module Bomoi.</span></h1><p>Choisissez votre module pour retrouver les étapes, les situations courantes et les manuels PDF.</p><ManualNavigation /></header>
    <div className="documentation-search"><label htmlFor="documentation-search">Rechercher dans les guides</label><input id="documentation-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex. valorisation, inventaire, reçu…"/><p role="status">{products.length + (showSchool ? 1 : 0)} documentation(s)</p></div>
    <div className="pos-manual-cards">{products.map(({ product, manual, sections }) => <article className="pos-manual-card documentation-product" key={product}>
      <span className="pos-manual-chapter-number">{manual.platform}</span><h2><a href={`/documentation/bomoi-${product}`}>{manual.name}</a></h2><p>{manual.description}</p><small>Édition du {manual.data.edition} · {manual.data.sections.length} chapitres</small>
      <ul>{sections.slice(0, query.trim() ? sections.length : 4).map(section => <li key={section.id}><a href={`/documentation/bomoi-${product}/${section.id}`}>{section.title} →</a></li>)}</ul>
      <div className="documentation-product-actions"><a className="btn btn-small" href={`/documentation/bomoi-${product}`}>Ouvrir le manuel</a><a href={`/documentation/bomoi-${product}-manuel-utilisateur.pdf`} download>PDF ↓</a></div>
    </article>)}{showSchool && <article className="pos-manual-card documentation-product documentation-planned"><span className="pos-manual-chapter-number">DOCUMENTATION À VENIR</span><h2>Bomoi School</h2><p>Un espace réservé au futur module scolaire. Les guides seront publiés lorsque les fonctionnalités et leurs parcours auront été définis.</p><a className="btn btn-small secondary" href="/documentation/bomoi-school">Découvrir cet espace →</a></article>}</div>
    {products.length === 0 && !showSchool && <div className="pos-manual-chapter"><h2>Aucun guide trouvé</h2><p>Essayez un autre mot ou choisissez directement un module.</p><button className="btn secondary" onClick={() => setQuery("")}>Afficher toutes les documentations</button></div>}
  </main>;
}
export function SchoolDocumentation() {
  return <main className="pos-manual documentation-hub notranslate" lang="fr" translate="no"><header className="pos-manual-hero"><a className="pos-manual-back" href="/documentation">← Centre de documentation</a><div className="pos-manual-brand"><span className="eyebrow">DOCUMENTATION EN PRÉPARATION</span></div><h1>Bienvenue dans l’espace <span>Bomoi School.</span></h1><p>Cet espace est réservé à la documentation du futur module scolaire. Aucun manuel opérationnel ni date de disponibilité ne sont annoncés à ce stade.</p><ManualNavigation current="school" /></header><section className="pos-manual-chapter"><h2>Une place prête pour les futurs guides</h2><p>La présentation du module, les guides utilisateurs et les questions fréquentes seront ajoutés ici après validation des fonctionnalités. Cette page ne décrit pas des fonctions déjà disponibles.</p><p>En attendant, les manuels Bomoi Stock, Bomoi Exchange et Bomoi POS sont accessibles depuis le centre de documentation.</p><a className="btn" href="/documentation">Consulter les guides disponibles</a></section></main>;
}
