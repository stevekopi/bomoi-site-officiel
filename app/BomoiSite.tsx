/* eslint-disable @next/next/no-html-link-for-pages, react-hooks/set-state-in-effect */
"use client";

import { AnchorHTMLAttributes, CSSProperties, FormEvent, useEffect, useState } from "react";
import i18n from "./i18n";

type IconName = "stock" | "sales" | "accounting" | "multi" | "mobile" | "api" | "report" | "users";
type Module = { title: string; desc: string; icon: IconName; group: string };

const modules: Module[] = [
  { title: "Gestion des stocks", desc: "Suivez les quantités, les coûts et la disponibilité en temps réel.", icon: "stock", group: "Stocks" },
  { title: "Articles et catégories", desc: "Structurez votre catalogue, unités, groupes et tarifs.", icon: "stock", group: "Stocks" },
  { title: "Entrées et sorties", desc: "Tracez chaque mouvement, transfert et ajustement de stock.", icon: "stock", group: "Stocks" },
  { title: "Inventaires", desc: "Comparez le stock théorique au physique et validez les écarts.", icon: "report", group: "Stocks" },
  { title: "Ventes et commandes", desc: "Gérez le cycle client, de la commande à la facturation.", icon: "sales", group: "Ventes" },
  { title: "Paiements clients", desc: "Suivez les règlements, soldes et échéances par client.", icon: "sales", group: "Ventes" },
  { title: "Livraisons et tournées", desc: "Planifiez les tournées et contrôlez les quantités livrées.", icon: "sales", group: "Ventes" },
  { title: "Achats et fournisseurs", desc: "Pilotez commandes, réceptions et comptes fournisseurs.", icon: "stock", group: "Achats" },
  { title: "Comptabilité", desc: "Automatisez les écritures et disposez d'états financiers fiables.", icon: "accounting", group: "Finance" },
  { title: "Trésorerie", desc: "Centralisez caisses, banques, encaissements et décaissements.", icon: "accounting", group: "Finance" },
  { title: "Rapports et tableaux de bord", desc: "Transformez vos données en décisions avec des indicateurs clairs.", icon: "report", group: "Pilotage" },
  { title: "Gestion multisite", desc: "Supervisez plusieurs magasins, dépôts et filiales depuis un espace unique.", icon: "multi", group: "Pilotage" },
  { title: "Utilisateurs et permissions", desc: "Attribuez précisément les rôles et sécurisez les opérations sensibles.", icon: "users", group: "Administration" },
  { title: "Bomoi Sales Mobile", desc: "Vendez et consultez l'essentiel depuis Android et iOS.", icon: "mobile", group: "Mobilité" },
  { title: "API et intégrations", desc: "Connectez Bomoi à vos services grâce à une API documentée.", icon: "api", group: "Écosystème" },
];

const nav = [
  ["Produit", "/a-propos"], ["Modules", "/modules"], ["Secteurs", "/secteurs"], ["Avantages", "/avantages"], ["Abonnements", "/abonnements"], ["Ressources", "/documentation"],
];

const contact = {
  phoneLabel: "+243 981 863 765",
  phoneHref: "tel:+243981863765",
  email: "contact@bomoi.cd",
  youtube: "https://www.youtube.com/@bomoi-enterprise-tv-pg2eo",
  tiktok: "https://www.tiktok.com/@app.bomoi",
  facebook: "https://www.facebook.com/profile.php?id=61576485095267",
};

function SiteLink({ href, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const internal=href.startsWith("/");
  return <a href={href} {...props} onClick={event=>{
    onClick?.(event);
    if(!internal||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||props.target)return;
    event.preventDefault();
    window.dispatchEvent(new CustomEvent("bomoi:navigate",{detail:href}));
  }}/>;
}

function SocialLinks(){const networks=[{name:"YouTube",url:contact.youtube,icon:"/social-youtube.svg",className:"youtube"},{name:"TikTok",url:contact.tiktok,icon:"/social-tiktok.svg",className:"tiktok"},{name:"Facebook",url:contact.facebook,icon:"/social-facebook.svg",className:"facebook"}];return <div className="social-links" aria-label="Réseaux sociaux de Bomoi">{networks.map(network=><SiteLink className={`social-link ${network.className}`} href={network.url} target="_blank" rel="noreferrer" key={network.name}><span className="social-icon"><img src={network.icon} alt=""/></span><span>{network.name}</span><b aria-hidden="true">↗</b></SiteLink>)}</div>}

function Icon({ name }: { name: IconName }) {
  const chars: Record<IconName, string> = { stock: "◇", sales: "↗", accounting: "₣", multi: "▦", mobile: "▯", api: "⌘", report: "⌁", users: "◎" };
  return <span className={`icon icon-${name}`} aria-hidden="true">{chars[name]}</span>;
}

function AnimatedBrandLogo() {
  return <span className="brand-logo-wrapper" aria-hidden="true">
    <span className="brand-logo-glow" />
    <span className="brand-logo-ring brand-logo-ring-primary" />
    <span className="brand-logo-ring brand-logo-ring-secondary" />
    <span className="brand-logo-orbit"><span className="brand-logo-particle" /></span>
    <span className="brand-logo-orbit brand-logo-orbit-reverse"><span className="brand-logo-particle brand-logo-particle-small" /></span>
    <span className="brand-logo-surface"><img className="brand-logo" src="/bomoi-logo.png" alt="" /></span>
  </span>;
}

const siteLanguages = [
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "ln", flag: "🇨🇩", name: "Lingála" },
  { code: "pt", flag: "🇵🇹", name: "Português" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "ar", flag: "🇸🇦", name: "العربية" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
];

const originalText=new WeakMap<Text,string>();
const originalAttributes=new WeakMap<Element,Record<string,string>>();
const translatableAttributes=["placeholder","aria-label","title"];

function translateDocument(language:string){
  const root=document.querySelector(".site");if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null;
  while((node=walker.nextNode())){const textNode=node as Text;const parent=textNode.parentElement;if(!parent||parent.closest(".notranslate,script,style"))continue;const original=originalText.get(textNode)??textNode.data;originalText.set(textNode,original);const value=original.trim();if(!value)continue;const translated=i18n.t(value,{lng:language,defaultValue:value});const next=original.replace(value,translated);if(textNode.data!==next)textNode.data=next}
  root.querySelectorAll<HTMLElement>("[placeholder],[aria-label],[title]").forEach(element=>{if(element.closest(".notranslate"))return;const saved=originalAttributes.get(element)??{};translatableAttributes.forEach(attribute=>{const current=element.getAttribute(attribute);if(current&&!saved[attribute])saved[attribute]=current;const original=saved[attribute];if(original)element.setAttribute(attribute,i18n.t(original,{lng:language,defaultValue:original}))});originalAttributes.set(element,saved)});
}

function LanguageSelector() {
  const [language,setLanguage]=useState("fr");
  const applyLanguage=(next:string)=>{
    setLanguage(next);localStorage.setItem("bomoi-language",next);document.documentElement.lang=next;document.documentElement.dir=next==="ar"?"rtl":"ltr";void i18n.changeLanguage(next).then(()=>translateDocument(next));
  };
  useEffect(()=>{
    const supported=siteLanguages.map(item=>item.code);const browserLanguage=navigator.language.split("-")[0];const initial=localStorage.getItem("bomoi-language")||((supported.includes(browserLanguage))?browserLanguage:"fr");setLanguage(initial);document.documentElement.lang=initial;document.documentElement.dir=initial==="ar"?"rtl":"ltr";
    void i18n.changeLanguage(initial).then(()=>translateDocument(initial));const observer=new MutationObserver(()=>translateDocument(i18n.language));const root=document.querySelector(".site");if(root)observer.observe(root,{subtree:true,childList:true,characterData:true});return()=>observer.disconnect();
  },[]);
  return <div className="language-control notranslate" translate="no"><label><span className="sr-only">Langue du site</span><select value={language} onChange={event=>applyLanguage(event.target.value)} aria-label="Choisir la langue du site">{siteLanguages.map(item=><option value={item.code} key={item.code}>{item.flag} {item.name}</option>)}</select></label></div>;
}

function Header({ theme, setTheme, route }: { theme: string; setTheme: (v: string) => void; route: string }) {
  const [open, setOpen] = useState(false);
  useEffect(()=>setOpen(false),[route]);
  const isActive=(href:string)=>href==="/documentation"?["/documentation","/actualites","/notes-de-version","/faq"].includes(route):route===href;
  return <header className="header"><div className="nav-wrap">
    <SiteLink className="brand" href="/" aria-label="Bomoi, accueil"><AnimatedBrandLogo/><span>Bomoi</span></SiteLink>
    <nav className={open ? "main-nav open" : "main-nav"} aria-label="Navigation principale">
      {nav.map(([label, href]) => <SiteLink className={isActive(href)?"active":""} aria-current={isActive(href)?"page":undefined} key={href} href={href}>{label}</SiteLink>)}
      <SiteLink className={route==="/actualites"?"mobile-only active":"mobile-only"} aria-current={route==="/actualites"?"page":undefined} href="/actualites">Actualités</SiteLink><SiteLink className={route==="/contact"?"mobile-only active":"mobile-only"} aria-current={route==="/contact"?"page":undefined} href="/contact">Contact</SiteLink><SiteLink className="mobile-only" href="https://app.bomoi.cd/login">Connectez-vous ↗</SiteLink>
    </nav>
    <div className="nav-actions">
      <LanguageSelector/>
      <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Activer le mode ${theme === "dark" ? "clair" : "sombre"}`}><span>{theme === "dark" ? "☀" : "☾"}</span></button>
      <SiteLink className="login-link" href="https://app.bomoi.cd/login">Connectez-vous</SiteLink>
      <SiteLink className="btn btn-small" href="/demonstration">Démonstration</SiteLink>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Ouvrir le menu">{open ? "×" : "☰"}</button>
    </div>
  </div></header>;
}

type BuildInfo = { version: string; commit: string; target: string; builtAt: string };

function Footer() {
  const [buildInfo,setBuildInfo]=useState<BuildInfo|null>(null);
  useEffect(()=>{fetch("/build-info.json",{cache:"no-store"}).then(response=>response.ok?response.json():null).then(info=>info&&setBuildInfo(info)).catch(()=>undefined)},[]);
  const deployedAt=buildInfo?new Intl.DateTimeFormat("fr-FR",{dateStyle:"short",timeStyle:"medium",timeZone:"Africa/Kinshasa"}).format(new Date(buildInfo.builtAt)):null;
  return <footer><div className="footer-grid">
    <div><SiteLink className="brand" href="/"><AnimatedBrandLogo/><span>Bomoi</span></SiteLink><p>L’ERP moderne qui relie vos équipes, vos sites et vos opérations.</p><div className="footer-contact"><SiteLink href={contact.phoneHref}>{contact.phoneLabel}</SiteLink><SiteLink href={`mailto:${contact.email}`}>{contact.email}</SiteLink></div><SocialLinks/></div>
    <div><h4>Produit</h4><SiteLink href="/modules">Modules</SiteLink><SiteLink href="/secteurs">Secteurs</SiteLink><SiteLink href="/avantages">Avantages</SiteLink><SiteLink href="/abonnements">Abonnements</SiteLink><SiteLink href="/demonstration">Démonstration</SiteLink></div>
    <div><h4>Ressources</h4><SiteLink href="/documentation">Documentation</SiteLink><SiteLink href="/actualites">Actualités</SiteLink><SiteLink href="/notes-de-version">Notes de version</SiteLink><SiteLink href="/faq">Questions fréquentes</SiteLink></div>
    <div><h4>Bomoi</h4><SiteLink href="/a-propos">À propos</SiteLink><SiteLink href="/partenaires">Partenaires</SiteLink><SiteLink href="/contact">Contact</SiteLink><SiteLink href="/confidentialite">Confidentialité</SiteLink></div>
  </div><div className="footer-bottom"><span>© 2026 Bomoi. Tous droits réservés.</span><span>Conçu pour les entreprises qui avancent.</span>{buildInfo&&<span className="build-info" title={`${buildInfo.target} · Commit ${buildInfo.commit} · ${buildInfo.builtAt}`}>{buildInfo.version} du {deployedAt}</span>}</div></footer>;
}

function Dashboard() {
  return <div className="dashboard-wrap" aria-label="Aperçu du tableau de bord Bomoi"><div className="glow" />
    <div className="dashboard">
      <div className="dash-side"><img className="mini-logo" src="/bomoi-logo.png" alt=""/>{["Tableau de bord", "Ventes", "Achats", "Stocks", "Finances", "Rapports"].map((x,i)=><span className={i===0?"active":""} key={x}>{i===0?"▦":"○"} {x}</span>)}</div>
      <div className="dash-main"><div className="dash-head"><strong>Tableau de bord</strong><span>Tous les sites⌄</span></div>
        <div className="kpi-grid"><div className="kpi"><small>Chiffre d’affaires</small><b>124,8 M FC</b><em>↗ 18,6 %</em><div className="spark">⌁⌁╱⌁╱</div></div><div className="kpi"><small>Stock disponible</small><b>68%</b><div className="donut" /></div><div className="kpi"><small>Commandes</small><b>1 243</b><em>↗ 12,4 %</em><div className="bars"><i/><i/><i/><i/><i/></div></div><div className="kpi"><small>Trésorerie</small><b>38,6 M FC</b><em>↗ 15,8 %</em><div className="spark violet">⌁╱⌁⌁╱</div></div></div>
        <div className="chart"><span>Évolution du chiffre d’affaires</span><div className="chart-lines"><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="chart-labels"><small>Jan.</small><small>Fév.</small><small>Mars</small><small>Avr.</small><small>Mai</small></div></div>
      </div>
    </div>
  </div>;
}

const benefits = [
  ["Une seule source de vérité", "Stocks, ventes, finances et opérations sont synchronisés dans un même environnement."],
  ["Conçu pour le multisite", "Gardez une vue consolidée tout en respectant l’autonomie de chaque site."],
  ["Décisions plus rapides", "Analysez vos indicateurs sans attendre la compilation manuelle de plusieurs fichiers."],
  ["Contrôle et traçabilité", "Suivez les actions, les validations et les mouvements sensibles de bout en bout."],
  ["Adapté à votre croissance", "Ajoutez progressivement des utilisateurs, sites et modules selon vos besoins."],
  ["Accessible partout", "Travaillez depuis le web ou Bomoi Sales Mobile, selon le rôle de chaque équipe."],
];

const sectors = ["Commerces & supermarchés", "Distribution", "Pharmacies", "Dépôts & entrepôts", "Entreprises multisites", "Organisations & projets"];
const trustedPartners = [
  { name: "Congo Build", logo: "/partner-congo-build.jpeg", tone: "dark", sector: "Construction", strength: "Gestion", strengthLabel: "Centralisée", scope: "Suivi", scopeLabel: "En temps réel" },
  { name: "Cure Pharma", logo: "/partner-cure-pharma.png", tone: "light", sector: "Pharmacie & santé", strength: "Stocks", strengthLabel: "Maîtrisés", scope: "Traçabilité", scopeLabel: "Renforcée" },
];

function TrustedPartnersSlider(){
  const [active,setActive]=useState(0);
  const [visible,setVisible]=useState(4);
  useEffect(()=>{const media=matchMedia("(max-width:760px)");const update=()=>setVisible(media.matches?2:4);update();media.addEventListener("change",update);return()=>media.removeEventListener("change",update)},[]);
  const maxIndex=Math.max(0,trustedPartners.length-visible);
  useEffect(()=>setActive(current=>Math.min(current,maxIndex)),[maxIndex]);
  const previous=()=>setActive(current=>Math.max(0,current-1));
  const next=()=>setActive(current=>Math.min(maxIndex,current+1));
  return <section className="logos-strip trust-carousel" aria-labelledby="trusted-title" onKeyDown={event=>{if(event.key==="ArrowLeft")previous();if(event.key==="ArrowRight")next()}}>
    <div className="trust-carousel-head"><div><span className="eyebrow" id="trusted-title">ILS NOUS FONT CONFIANCE</span><h2>Des entreprises qui avancent avec Bomoi</h2></div><span className="trust-count" aria-live="polite">{trustedPartners.length} partenaires</span></div>
    <div className="trust-slider-window"><div className="trust-slider-track" style={{transform:`translateX(-${active*(100/visible)}%)`,"--visible-partners":visible} as CSSProperties}>{trustedPartners.map(partner=><figure className={`partner-logo-card trust-story-card ${partner.tone}`} key={partner.name}><img src={partner.logo} alt={`Univers de ${partner.name}`}/><figcaption><span className="trust-story-sector">{partner.sector}</span><div className="trust-story-copy"><h3>{partner.name}</h3><div className="trust-story-metrics"><span><b>{partner.strength}</b><small>{partner.strengthLabel}</small></span><span><b>{partner.scope}</b><small>{partner.scopeLabel}</small></span></div></div></figcaption></figure>)}</div></div>
    <div className="trust-controls"><button type="button" onClick={previous} disabled={active===0} aria-label="Partenaires précédents">← <span>Précédent</span></button><div className="trust-dots" aria-label="Position du carrousel">{Array.from({length:maxIndex+1},(_,index)=><button type="button" className={index===active?"active":""} onClick={()=>setActive(index)} aria-label={`Position ${index+1}`} aria-current={index===active?"true":undefined} key={index}/>)}</div><button type="button" onClick={next} disabled={active===maxIndex} aria-label="Partenaires suivants"><span>Suivant</span> →</button></div>
  </section>;
}

const productScreens = [
  {src:"/bomoi-cashflow.jpg", title:"Tendances et trésorerie", text:"Analysez les entrées de fonds et les performances quotidiennes."},
  {src:"/bomoi-deliveries.jpg", title:"Commandes et livraisons", text:"Comparez les quantités commandées, livrées et restantes."},
  {src:"/bomoi-stock.jpg", title:"Mouvements de stock", text:"Retrouvez chaque opération, article et transaction dans un journal précis."},
  {src:"/bomoi-accounting.jpg", title:"Comptabilité intégrée", text:"Consultez vos balances et rapports financiers dans le même espace."},
  {src:"/bomoi-balance-sheet.jpg", title:"Bilan comptable", text:"Comparez l’actif et le passif et vérifiez immédiatement l’équilibre de votre situation patrimoniale."},
  {src:"/bomoi-inventory.jpg", title:"Inventaire détaillé", text:"Contrôlez les quantités physiques, les écarts et la valeur de chaque groupe d’articles."},
  {src:"/bomoi-login.jpg", title:"Connexion sécurisée", text:"Accédez simplement à votre espace de travail Bomoi."},
];

function ProductShowcase(){return <section className="section product-showcase" aria-labelledby="product-showcase-title"><div className="section-heading"><div><span className="eyebrow">LE VRAI BOMOI</span><h2 id="product-showcase-title">Votre activité, clairement devant vous.</h2></div><p>Découvrez l’interface réellement utilisée pour piloter les ventes, les stocks, les livraisons et la comptabilité.</p></div><div className="product-gallery">{productScreens.map((screen,index)=><figure className={index===0?"product-screen featured":"product-screen"} key={screen.title}><div className="screen-browser" aria-hidden="true"><i/><i/><i/></div><img src={screen.src} alt={`Interface Bomoi — ${screen.title}`} loading="lazy"/><figcaption><span>0{index+1}</span><div><h3>{screen.title}</h3><p>{screen.text}</p></div></figcaption></figure>)}</div></section>}

function HomePage() {
  return <>
    <section className="hero"><div className="hero-grid"><div className="hero-copy"><span className="eyebrow">ERP MODERNE · MULTISITE</span><h1>Pilotez toute votre entreprise, <span>simplement.</span></h1><p>Bomoi centralise vos stocks, ventes, achats, finances et opérations multisites dans une plateforme claire, rapide et sécurisée.</p><div className="hero-actions"><SiteLink className="btn" href="/demonstration">Demander une démonstration</SiteLink><SiteLink className="btn secondary" href="/modules">Découvrir les modules</SiteLink></div><div className="trust-row"><span>◉ <b>Sécurisé</b></span><span>ϟ <b>Rapide</b></span><span>▦ <b>Multisite</b></span><span>☁ <b>Accessible</b></span></div></div><figure className="hero-product"><div className="screen-browser" aria-hidden="true"><i/><i/><i/><span>app.bomoi.cd</span></div><img src="/bomoi-dashboard.jpg" alt="Tableau de bord réel de Bomoi"/><figcaption>Tableau de bord Bomoi · Vue opérationnelle</figcaption></figure></div></section>
    <TrustedPartnersSlider />
    <section className="section"><div className="section-heading"><div><span className="eyebrow">UN ERP COMPLET</span><h2>Tout ce qu’il faut pour mieux gérer.</h2></div><p>Des modules reliés entre eux pour suivre l’activité sans multiplier les outils ni ressaisir les mêmes données.</p></div><div className="feature-grid">{modules.slice(0,6).map(m=><SiteLink className="feature-card" href="/modules" key={m.title}><Icon name={m.icon}/><h3>{m.title}</h3><p>{m.desc}</p><span>Explorer <b>→</b></span></SiteLink>)}</div><div className="center"><SiteLink className="text-link" href="/modules">Voir les 15 modules →</SiteLink></div></section>
    <section className="section split-section"><div><span className="eyebrow">UNE VUE À 360°</span><h2>Vos chiffres deviennent des décisions.</h2><p>Bomoi relie les données de chaque service. Vous disposez d’une vision fiable des ventes, du stock, des créances et de la trésorerie, au moment où vous en avez besoin.</p><ul className="check-list"><li>Indicateurs actualisés en temps réel</li><li>Rapports détaillés par site, article ou période</li><li>Contrôle des accès selon les responsabilités</li></ul><SiteLink className="btn secondary" href="/avantages">Pourquoi choisir Bomoi</SiteLink></div><figure className="real-workspace-shot"><img src="/bomoi-workspace.jpg" alt="Espace de travail réel dans Bomoi" loading="lazy"/><figcaption>Un espace centralisé pour toute votre équipe.</figcaption></figure></section>
    <ProductShowcase />
    <section className="section"><div className="section-heading"><div><span className="eyebrow">POUR VOTRE SECTEUR</span><h2>Bomoi s’adapte à votre réalité.</h2></div><p>Une base commune, configurée selon vos flux, vos équipes et votre organisation.</p></div><div className="sector-grid">{sectors.map((s,i)=><SiteLink href="/secteurs" key={s}><span>0{i+1}</span><h3>{s}</h3><b>→</b></SiteLink>)}</div></section>
    <section className="section benefits-section"><div className="section-heading"><div><span className="eyebrow">LES AVANTAGES BOMOI</span><h2>Moins de friction. Plus de maîtrise.</h2></div></div><div className="benefit-grid">{benefits.slice(0,4).map(([t,d],i)=><article key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>
    <YouTubeSection />
    <NewsPreview />
    <CTA />
  </>;
}

function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) { return <section className="page-hero"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></section>; }
function CTA() { return <section className="cta"><div><span className="eyebrow">PRÊT À AVANCER ?</span><h2>Voyez Bomoi à l’œuvre.</h2><p>Parlez-nous de votre activité. Notre équipe vous présentera les modules les plus adaptés à vos besoins.</p></div><div><SiteLink className="btn light" href="/demonstration">Demander une démonstration</SiteLink><SiteLink className="btn ghost" href="/contact">Contacter l’équipe</SiteLink></div></section>; }

function YouTubeSection() {
  const channelUrl = "https://www.youtube.com/channel/UCMQzyOcNp6RJ2VWz-s_i-BQ";
  return <section className="section youtube-section" aria-labelledby="youtube-title">
    <div className="youtube-copy">
      <span className="eyebrow">BOMOI SUR YOUTUBE</span>
      <h2 id="youtube-title">Découvrez notre dernière vidéo.</h2>
      <p>Conseils, démonstrations et nouveautés : suivez Bomoi en vidéo et restez au plus près de nos évolutions.</p>
      <SiteLink className="btn youtube-button" href={channelUrl} target="_blank" rel="noreferrer">Voir la chaîne YouTube <span aria-hidden="true">↗</span></SiteLink>
    </div>
    <div className="youtube-player">
      <iframe
        src="https://www.youtube-nocookie.com/embed/videoseries?list=UUMQzyOcNp6RJ2VWz-s_i-BQ"
        title="Dernière vidéo publiée sur la chaîne YouTube de Bomoi"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  </section>;
}

function AboutPage() { return <><PageHero eyebrow="À PROPOS" title="Une gestion plus claire pour des entreprises plus fortes." intro="Bomoi est une plateforme ERP conçue pour aider les organisations à structurer leurs opérations, fiabiliser leurs données et grandir avec maîtrise."/><section className="section prose-grid"><div><h2>Notre raison d’être</h2><p>De nombreuses entreprises pilotent encore leurs activités avec des informations dispersées. Bomoi rassemble ces flux dans un environnement cohérent, adapté aux réalités des équipes et des organisations multisites.</p><p>Notre ambition est simple : rendre les outils de gestion avancés plus accessibles, plus lisibles et réellement utiles au quotidien.</p></div><div className="quote-card"><span>NOTRE VISION</span><blockquote>Faire de la donnée opérationnelle un levier de confiance, de performance et de croissance durable.</blockquote><small>Texte institutionnel provisoire — à valider</small></div></section><section className="section values"><h2>Ce qui guide Bomoi</h2><div className="feature-grid three">{[["Clarté","Une information compréhensible et exploitable."],["Fiabilité","Des données tracées, cohérentes et sécurisées."],["Proximité","Une solution pensée avec les réalités du terrain."]].map(([t,d])=><article className="feature-card" key={t}><h3>{t}</h3><p>{d}</p></article>)}</div></section><CTA/></>; }

function ModulesPage() { const groups=[...new Set(modules.map(m=>m.group))]; return <><PageHero eyebrow="15 MODULES CONNECTÉS" title="Une plateforme. Toute votre activité." intro="Activez les fonctions dont votre entreprise a besoin aujourd’hui et faites évoluer Bomoi avec votre organisation."/><section className="section module-catalog">{groups.map(g=><div className="module-group" key={g}><div><span>{g}</span><small>{modules.filter(m=>m.group===g).length} module(s)</small></div><div>{modules.filter(m=>m.group===g).map(m=><article key={m.title}><Icon name={m.icon}/><div><h3>{m.title}</h3><p>{m.desc}</p></div></article>)}</div></div>)}</section><CTA/></>; }

function SectorsPage() { const desc=["Centralisez ventes, stocks, caisses et points de vente.","Coordonnez commandes, approvisionnement et livraisons.","Suivez lots, péremptions, articles et mouvements sensibles.","Maîtrisez emplacements, quantités et traçabilité.","Comparez les performances et consolidez les données.","Gérez budgets, actifs, équipes et reporting opérationnel."]; return <><PageHero eyebrow="SECTEURS D’ACTIVITÉ" title="Une solution qui comprend vos opérations." intro="Bomoi s’adapte aux processus de chaque secteur sans perdre la cohérence d’une plateforme intégrée."/><section className="section sector-detail">{sectors.map((s,i)=><article key={s}><span>0{i+1}</span><div><h2>{s}</h2><p>{desc[i]}</p><ul><li>Configuration adaptée</li><li>Rapports par activité</li><li>Accès par responsabilité</li></ul></div></article>)}</section><CTA/></>; }

function AdvantagesPage() { return <><PageHero eyebrow="AVANTAGES" title="Travaillez avec des données fiables, partout." intro="Bomoi réduit les tâches répétitives, fluidifie la collaboration et donne aux responsables une vision consolidée de l’activité."/><section className="section"><div className="benefit-grid large">{benefits.map(([t,d],i)=><article key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section><section className="section comparison"><div><span className="eyebrow">AVANT BOMOI</span><h2>Fichiers dispersés, ressaisies et décisions tardives.</h2></div><div><span className="eyebrow">AVEC BOMOI</span><h2>Une information partagée, tracée et disponible.</h2></div></section><CTA/></>; }

const planCategories = [
  { name: "Essentiel", desc: "Idéal pour les indépendants et petites structures.", popular: false, tiers: [
    { users: "1 utilisateur", price: "35" },
    { users: "2 utilisateurs", price: "65" },
    { users: "3 utilisateurs", price: "100" },
    { users: "5 utilisateurs", price: "155" },
  ] },
  { name: "Business", desc: "Tout ce qu’il vous faut pour une gestion performante.", popular: true, tiers: [
    { users: "10 utilisateurs", price: "300" },
    { users: "20 utilisateurs", price: "550" },
    { users: "30 utilisateurs", price: "880" },
  ] },
  { name: "Enterprise", desc: "Pour les grandes organisations et réseaux multisites.", popular: false, tiers: [
    { users: "50 utilisateurs", price: "1450" },
    { users: "100 utilisateurs", price: "2800" },
  ] },
];
const plans = planCategories.flatMap(category => category.tiers.map(tier => ({
  ...tier, name: category.name, id: `${category.name}-${tier.price}`,
})));

function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState("Business-300");
  const [categoryChoices, setCategoryChoices] = useState<Record<string, string>>({});
  const [requestUrl, setRequestUrl] = useState("");
  const selected = plans.find(plan => plan.id === selectedPlan) ?? plans[4];

  function choosePlan(id: string) {
    const plan = plans.find(item => item.id === id);
    if (!plan) return;
    setSelectedPlan(id);
    setCategoryChoices(choices => ({ ...choices, [plan.name]: plan.price }));
    setRequestUrl("");
  }

  function prepareSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const details = [
      "Bonjour Bomoi,",
      "",
      "Je souhaite finaliser une demande d’abonnement.",
      `Plan : ${selected.name}`,
      `Utilisateurs : ${selected.users}`,
      `Abonnement mensuel (1 site inclus) : ${selected.price} USD`,
      "Multisite et frais de mise en service : à confirmer séparément.",
      `Entreprise : ${data.get("company")}`,
      `Responsable : ${data.get("name")}`,
      `E-mail : ${data.get("email")}`,
      `Téléphone : ${data.get("phone")}`,
      `Ville / Pays : ${data.get("location")}`,
      `Mode de paiement envisagé : ${data.get("paymentMethod")}`,
      `Nom du payeur : ${data.get("payerName")}`,
      `Téléphone ou référence du payeur : ${data.get("payerReference")}`,
      "",
      "Aucun paiement n’a encore été effectué.",
    ];
    setRequestUrl(`mailto:${contact.email}?subject=${encodeURIComponent(`Demande d’abonnement Bomoi — ${selected.name} — ${selected.users}`)}&body=${encodeURIComponent(details.join("\n"))}`);
  }

  return <>
    <PageHero eyebrow="ABONNEMENT MENSUEL" title="Choisissez le plan adapté à votre équipe." intro="Des offres simples et évolutives pour gérer votre entreprise avec Bomoi, quelle que soit sa taille."/>
    <section className="section pricing-section">
      <div className="plan-grid">{planCategories.map(category => {
        const tier = category.tiers.find(item => item.price === categoryChoices[category.name]) ?? category.tiers[0];
        return <article className={category.popular ? "plan-card popular" : "plan-card"} key={category.name}>
          {category.popular && <span className="popular-badge">POPULAIRE</span>}
          <div className="plan-users" aria-hidden="true">●●●</div>
          <h2>{category.name}</h2>
          <label className="plan-selector" htmlFor={`users-${category.name}`}>Nombre d’utilisateurs
            <select id={`users-${category.name}`} value={tier.price} onChange={event => choosePlan(`${category.name}-${event.target.value}`)}>
              {category.tiers.map(option => <option key={option.price} value={option.price}>{option.users} — {option.price} USD/mois</option>)}
            </select>
          </label>
          <div className="plan-price" aria-live="polite" aria-atomic="true" key={tier.price}><strong>{tier.price}</strong><span><b>USD</b>par mois</span></div>
          <p className="plan-desc">{category.desc}</p>
          <SiteLink className={category.popular ? "btn" : "btn secondary"} href="#souscription" onClick={() => choosePlan(`${category.name}-${tier.price}`)}>Choisir {category.name}</SiteLink>
        </article>;
      })}</div>
      <div className="plans-included"><span>✓ 1 site inclus</span><span>✓ Mises à jour régulières</span><span>✓ Sauvegardes automatiques</span><span>✓ Support dédié</span><span>✓ Accès partout, tout le temps</span><span>✓ Hébergement sécurisé</span></div>
      <section className="multisite-pricing" aria-labelledby="multisite-title"><div className="multisite-heading"><div><span className="eyebrow">TARIFICATION MULTISITE</span><h2 id="multisite-title">Un prix simple, même lorsque votre réseau grandit.</h2></div><p>Chaque abonnement comprend un site. Les utilisateurs sont partagés entre tous les sites, dans la limite du forfait choisi.</p></div><div className="multisite-grid"><div className="multisite-table-wrap"><table><thead><tr><th>Configuration</th><th>Supplément mensuel</th></tr></thead><tbody><tr><td>1 site</td><td><strong>Inclus</strong></td></tr><tr><td>2 à 3 sites</td><td><strong>+50 USD</strong> par site supplémentaire</td></tr><tr><td>4 à 10 sites</td><td><strong>+40 USD</strong> par site supplémentaire</td></tr><tr><td>Plus de 10 sites</td><td><strong>Sur devis</strong></td></tr></tbody></table></div><div className="multisite-examples"><span className="eyebrow">EXEMPLES</span><article><div><b>Business · 3 sites</b><small>10 utilisateurs partagés</small></div><strong>400 USD<small>/mois</small></strong></article><article><div><b>Business · 5 sites</b><small>20 utilisateurs partagés</small></div><strong>710 USD<small>/mois</small></strong></article><article><div><b>Business · 10 sites</b><small>30 utilisateurs partagés</small></div><strong>1 240 USD<small>/mois</small></strong></article></div></div><p className="multisite-detail"><b>À savoir :</b> un point de vente supplémentaire et une société juridiquement distincte n’impliquent pas la même complexité. Les configurations avec comptabilités séparées, reprises de données ou règles propres à chaque entité font l’objet d’un devis personnalisé.</p></section>
      <aside className="acquisition-note" aria-labelledby="acquisition-title"><div className="acquisition-icon" aria-hidden="true">＋</div><div><span className="eyebrow">MISE EN SERVICE SUR MESURE</span><h2 id="acquisition-title">Un coût d’acquisition adapté à votre projet.</h2><p>Un coût initial s’ajoute à l’abonnement mensuel. Il est établi sur devis selon les besoins et la complexité du projet.</p><ul><li>Déploiement de la solution</li><li>Formation des équipes</li><li>Paramétrage personnalisé</li><li>Niveau de détail comptable retenu</li></ul></div></aside>
      <div className="billing-note"><div><span className="eyebrow">SÉCURISÉ · FIABLE · ÉVOLUTIF</span><h2>Tout ce qu’il faut pour avancer sereinement.</h2><p>Tous les plans incluent les mises à jour, la sauvegarde automatique et le support.</p></div><div><b>Facturation mensuelle</b><span>Sans engagement</span><span>Résiliez à tout moment</span></div></div>
    </section>
    <section className="section subscription-section" id="souscription">
      <div className="subscription-heading"><div><span className="eyebrow">SOUSCRIPTION</span><h2>Préparez votre abonnement.</h2><p>Renseignez les coordonnées de votre entreprise et du payeur. L’équipe Bomoi vous contactera pour confirmer l’activation.</p></div><ol aria-label="Étapes de souscription"><li className="done"><b>1</b>Plan</li><li className="active"><b>2</b>Coordonnées</li><li><b>3</b>Confirmation</li></ol></div>
      {requestUrl ? <div className="subscription-success"><span aria-hidden="true">✓</span><div><small>DEMANDE PRÊTE</small><h3>Aucune transaction n’a été effectuée.</h3><p>Vos coordonnées sont prêtes à être envoyées à l’équipe Bomoi. Vous pourrez confirmer le paiement avec elle dès qu’elle vous contacte.</p><div className="subscription-actions"><SiteLink className="btn" href={requestUrl}>Envoyer la demande par e-mail</SiteLink><button className="btn secondary" type="button" onClick={()=>setRequestUrl("")}>Modifier les coordonnées</button></div></div></div> :
      <form className="subscription-checkout" onSubmit={prepareSubscription}>
        <aside className="subscription-summary"><span className="eyebrow">VOTRE CHOIX</span><h3 key={selected.name}>{selected.name}</h3><p key={selected.id}>{selected.users}</p><div key={selected.price}><strong>{selected.price}</strong><span><b>USD</b> / mois</span></div><ul><li>Mises à jour incluses</li><li>Sauvegarde automatique</li><li>Support Bomoi</li><li>Sans engagement</li></ul><small>Le montant mensuel et les frais d’acquisition sur devis seront confirmés par l’équipe Bomoi avant activation.</small></aside>
        <div className="subscription-form">
          <div className="form-section-title"><span>01</span><div><h3>Entreprise et responsable</h3><p>Les informations nécessaires pour créer votre dossier.</p></div></div>
          <div className="form-row"><label>Plan choisi<select name="plan" value={selectedPlan} onChange={event=>choosePlan(event.target.value)}>{planCategories.map(category=><optgroup label={category.name} key={category.name}>{plans.filter(plan=>plan.name===category.name).map(plan=><option value={plan.id} key={plan.id}>{plan.name} — {plan.users} — {plan.price} USD/mois</option>)}</optgroup>)}</select></label><label>Nom de l’entreprise<input name="company" required autoComplete="organization" placeholder="Ex. Société Bomoi"/></label></div>
          <div className="form-row"><label>Nom du responsable<input name="name" required autoComplete="name" placeholder="Nom et prénom"/></label><label>Adresse e-mail<input name="email" type="email" required autoComplete="email" placeholder="nom@entreprise.cd"/></label></div>
          <div className="form-row"><label>Téléphone / WhatsApp<input name="phone" type="tel" required autoComplete="tel" placeholder="+243 ..."/></label><label>Ville et pays<input name="location" required autoComplete="address-level2" placeholder="Kinshasa, RDC"/></label></div>
          <div className="form-section-title payment-title"><span>02</span><div><h3>Coordonnées de paiement</h3><p>Choisissez le moyen que vous souhaitez utiliser après confirmation.</p></div></div>
          <fieldset className="payment-methods"><legend>Mode de paiement envisagé</legend>{["M-Pesa","Airtel Money","Orange Money","Virement bancaire"].map(method=><label key={method}><input type="radio" name="paymentMethod" value={method} required/><span>{method}</span></label>)}</fieldset>
          <div className="form-row"><label>Nom du payeur<input name="payerName" required autoComplete="name" placeholder="Titulaire du compte"/></label><label>Téléphone ou référence du payeur<input name="payerReference" required placeholder="Numéro Mobile Money ou référence"/></label></div>
          <div className="temporary-payment-note"><b>Paiement bientôt automatisé</b><p>Cette étape prépare uniquement votre demande. Aucun débit n’est réalisé et nous ne demandons jamais votre code PIN ni vos données de carte. Les API de paiement seront ajoutées ultérieurement.</p></div>
          <label className="subscription-consent"><input type="checkbox" required/><span>J’accepte d’être contacté par Bomoi pour confirmer l’abonnement et les modalités de paiement.</span></label>
          <button className="btn subscription-submit" type="submit">Préparer ma demande <span aria-hidden="true">→</span></button>
        </div>
      </form>}
    </section>
    <section className="cta pricing-cta"><div><span className="eyebrow">BESOIN DE CONSEIL ?</span><h2>Trouvons le bon plan ensemble.</h2><p>Notre équipe vous aide à choisir l’abonnement adapté à votre organisation et à vos objectifs.</p></div><div><SiteLink className="btn light" href="tel:+243981863765">+243 981 863 765</SiteLink><SiteLink className="btn ghost" href="mailto:contact@bomoi.cd">contact@bomoi.cd</SiteLink></div></section>
  </>;
}

const news = [
  {date:"30 juillet 2026", tag:"Produit", title:"Nouveau : configuration sécurisée des webhooks", text:"Les entreprises peuvent désormais configurer leurs callbacks et signatures HMAC."},
  {date:"24 juillet 2026", tag:"Mobile", title:"Bomoi Sales Mobile entre en phase de préparation", text:"Une expérience de vente dédiée aux équipes Android et iOS."},
  {date:"18 juillet 2026", tag:"Stocks", title:"Des inventaires multisites plus précis", text:"Nouveaux filtres, validation multiple et rapports enrichis."},
];
function NewsPreview() { return <section className="section news-section"><div className="section-heading"><div><span className="eyebrow">ACTUALITÉS</span><h2>Les dernières évolutions.</h2></div><SiteLink className="text-link" href="/actualites">Toutes les actualités →</SiteLink></div><div className="news-grid">{news.map(n=><article key={n.title}><div className="news-image"><span>Visuel à fournir</span></div><small>{n.tag} · {n.date}</small><h3>{n.title}</h3><p>{n.text}</p><SiteLink href="/actualites">Lire l’article →</SiteLink></article>)}</div></section>; }
function NewsPage() { return <><PageHero eyebrow="ACTUALITÉS" title="La vie et les évolutions de Bomoi." intro="Retrouvez les nouveautés produit, conseils pratiques et informations de l’écosystème Bomoi."/><section className="section news-grid all">{[...news,...news.map((n,i)=>({...n,title:["Mieux piloter ses tournées de livraison","Comprendre le stock disponible","Les tableaux de bord au service des décisions"][i],tag:"Conseils"}))].map((n,i)=><article key={i}><div className="news-image"><span>Visuel éditorial {i+1}</span></div><small>{n.tag} · {n.date}</small><h3>{n.title}</h3><p>{n.text}</p><SiteLink href="#">Lire l’article →</SiteLink></article>)}</section></>; }

function ReleasesPage() { const releases=[{v:"2.10.113",d:"30 juillet 2026",items:["Configuration des webhooks par entreprise","Signature HMAC des callbacks","Améliorations de fiabilité des opérations"]},{v:"2.10.112",d:"27 juillet 2026",items:["Inventaires multisites et validation multiple","Rapports PDF et Excel enrichis","Optimisation des mouvements de stock"]},{v:"2.10.111",d:"18 juillet 2026",items:["Nouveaux rapports commandes et livraisons","Améliorations du thème sombre","Corrections de performance"]}]; return <><PageHero eyebrow="NOTES DE VERSION" title="Bomoi évolue, version après version." intro="Consultez les nouveautés, améliorations et corrections livrées dans chaque version."/><section className="section releases">{releases.map((r,i)=><article key={r.v}><div><span className="version">v{r.v}</span><time>{r.d}</time>{i===0&&<b>Version actuelle</b>}</div><ul>{r.items.map(x=><li key={x}>{x}</li>)}</ul></article>)}</section></>; }

function PartnersPage() { return <><PageHero eyebrow="PARTENAIRES & RÉFÉRENCES" title="Un écosystème fondé sur la confiance." intro="Bomoi grandit avec ses clients, partenaires d’implémentation et acteurs technologiques."/><section className="section partner-grid">{["Partenaire technologique","Client de référence","Partenaire intégrateur","Client multisite","Partenaire métier","Organisation partenaire"].map((x,i)=><article key={i}><div>LOGO</div><h3>{x} {String(i+1).padStart(2,"0")}</h3><p>Présentation officielle à compléter après validation du partenaire.</p></article>)}</section><section className="section partner-note"><h2>Devenir partenaire Bomoi</h2><p>Vous accompagnez des entreprises dans leur transformation, leur gestion ou leur infrastructure ? Construisons ensemble des solutions adaptées.</p><SiteLink className="btn" href="/contact">Parler à l’équipe</SiteLink></section></>; }

const docCats=[{title:"Bien démarrer",items:["Présentation de Bomoi","Se connecter","Configurer votre entreprise","Comprendre la navigation"]},{title:"Stocks",items:["Créer un article","Enregistrer une entrée","Effectuer une sortie","Réaliser un inventaire"]},{title:"Ventes",items:["Créer une commande","Enregistrer un paiement","Planifier une livraison"]},{title:"Administration",items:["Gérer les utilisateurs","Rôles et permissions","Configuration multisite"]}];
function DocumentationPage() { const [query,setQuery]=useState(""); const filtered=docCats.map(c=>({...c,items:c.items.filter(i=>i.toLowerCase().includes(query.toLowerCase()))})); return <div className="docs-layout"><aside className="docs-sidebar"><SiteLink className="docs-home" href="/documentation">Centre de documentation</SiteLink><label className="doc-search">⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un guide..." /></label>{filtered.map(c=><div className="doc-category" key={c.title}><h4>{c.title}</h4>{c.items.map((i,n)=><SiteLink className={c.title==="Stocks"&&n===1?"selected":""} key={i} href="#article">{i}</SiteLink>)}</div>)}</aside><main className="doc-main" id="article"><div className="breadcrumbs"><SiteLink href="/documentation">Documentation</SiteLink><span>›</span><SiteLink href="#">Stocks</SiteLink><span>›</span><b>Enregistrer une entrée</b></div><div className="doc-content"><article><div className="doc-title"><span className="version">Bomoi 2.10+</span><h1>Enregistrer une entrée de stock</h1><p>Apprenez à enregistrer la réception ou l’ajout d’articles dans un stockage.</p><small>Mis à jour le 30 juillet 2026 · 6 min de lecture</small></div><div className="callout info"><b>Information</b><p>Vous devez disposer de la permission de création des mouvements de stock.</p></div><h2 id="before">Avant de commencer</h2><p>Vérifiez que l’article, le stockage et le type de mouvement existent dans votre espace Bomoi.</p><h2 id="steps">Étapes</h2><ol><li>Dans le menu principal, ouvrez <b>Stocks</b>, puis <b>Mouvements</b>.</li><li>Sélectionnez <b>Nouvelle entrée</b>.</li><li>Renseignez le stockage, le type, l’article, l’emplacement et la quantité.</li></ol><div className="screenshot-placeholder"><span>CAPTURE D’ÉCRAN À INSÉRER</span><small>Écran : création d’une entrée de stock</small></div><div className="callout tip"><b>Conseil</b><p>Ajoutez plusieurs articles à la même opération pour accélérer la saisie d’une réception.</p></div><h2 id="validate">Valider l’opération</h2><p>Contrôlez les lignes avant confirmation. Selon la configuration, une validation supplémentaire peut être requise.</p><div className="callout warning"><b>Attention</b><p>Une opération confirmée modifie immédiatement le stock disponible.</p></div><div className="callout error"><b>Erreur fréquente</b><p>Si l’enregistrement échoue, vérifiez que le type de mouvement sélectionné accepte les entrées.</p></div><div className="doc-nav"><SiteLink href="#">← Créer un article</SiteLink><SiteLink href="#">Effectuer une sortie →</SiteLink></div></article><aside className="toc"><b>Dans cet article</b><SiteLink href="#before">Avant de commencer</SiteLink><SiteLink href="#steps">Étapes</SiteLink><SiteLink href="#validate">Valider l’opération</SiteLink><hr/><span>Cette page vous a-t-elle aidé ?</span><div><button>Oui</button><button>Non</button></div></aside></div></main></div>; }

function FormPage({type}:{type:"demo"|"contact"}) { const [sent,setSent]=useState(false); function submit(e:FormEvent){e.preventDefault();setSent(true)} const demo=type==="demo"; return <><PageHero eyebrow={demo?"DÉMONSTRATION":"CONTACT"} title={demo?"Découvrez Bomoi avec vos propres enjeux.":"Parlons de votre projet."} intro={demo?"Présentez-nous votre activité et recevez une démonstration adaptée à vos flux.":"Une question sur Bomoi, ses modules ou son déploiement ? Notre équipe vous répond."}/><section className="section form-layout"><div><h2>{demo?"Une présentation personnalisée":"Nous sommes à votre écoute"}</h2><p>{demo?"Pendant la démonstration, nous parcourrons les modules correspondant à votre secteur, vos sites et vos priorités.":"Appelez-nous, écrivez-nous ou retrouvez Bomoi sur les réseaux sociaux."}</p><ul className="check-list"><li>Échange sur vos processus actuels</li><li>Présentation des modules pertinents</li><li>Réponses à vos questions techniques</li></ul><div className="contact-card"><small>CONTACT DIRECT</small><SiteLink href={contact.phoneHref}><b>{contact.phoneLabel}</b></SiteLink><SiteLink href={`mailto:${contact.email}`}>{contact.email}</SiteLink><span>Kinshasa, République démocratique du Congo</span><div className="social-links"><SiteLink href={contact.youtube} target="_blank" rel="noreferrer">YouTube ↗</SiteLink><SiteLink href={contact.tiktok} target="_blank" rel="noreferrer">TikTok ↗</SiteLink><SiteLink href={contact.facebook} target="_blank" rel="noreferrer">Facebook ↗</SiteLink></div></div></div>{sent?<div className="success"><span>✓</span><h2>Demande enregistrée</h2><p>Merci. Dans la version finale, cette demande sera transmise à l’équipe Bomoi.</p><button className="btn" onClick={()=>setSent(false)}>Nouvelle demande</button></div>:<form onSubmit={submit}><div className="form-row"><label>Prénom et nom<input required placeholder="Votre nom"/></label><label>Entreprise<input required placeholder="Nom de l’entreprise"/></label></div><div className="form-row"><label>Adresse e-mail<input required type="email" placeholder="vous@entreprise.com"/></label><label>Téléphone<input placeholder="+243 ..."/></label></div>{demo&&<div className="form-row"><label>Secteur<select defaultValue=""><option value="" disabled>Sélectionner</option>{sectors.map(s=><option key={s}>{s}</option>)}</select></label><label>Nombre de sites<select><option>1 site</option><option>2 à 5 sites</option><option>6 à 20 sites</option><option>Plus de 20 sites</option></select></label></div>}<label>Votre message<textarea required rows={5} placeholder={demo?"Décrivez brièvement votre activité et vos besoins...":"Comment pouvons-nous vous aider ?"}/></label><button className="btn" type="submit">{demo?"Envoyer ma demande":"Envoyer le message"}</button><small className="form-note">Formulaire de démonstration — connexion au service d’envoi à prévoir.</small></form>}</section></>; }

function FAQPage() { const qs=[["À quelles entreprises Bomoi s’adresse-t-il ?","Aux commerces, distributeurs, pharmacies, dépôts, entrepôts et organisations qui souhaitent centraliser leur gestion, y compris avec plusieurs sites."],["Peut-on utiliser seulement certains modules ?","Oui. La configuration peut être adaptée aux besoins actuels de l’entreprise et évoluer progressivement."],["Bomoi fonctionne-t-il sur mobile ?","L’interface web est responsive et l’application Bomoi Sales Mobile est prévue pour les équipes commerciales Android et iOS."],["Les droits des utilisateurs sont-ils configurables ?","Oui. Les rôles et permissions permettent de contrôler l’accès aux fonctions et opérations sensibles."],["Bomoi propose-t-il une API ?","Oui. Des API et mécanismes d’intégration permettent de relier Bomoi à d’autres services."],["Comment obtenir une démonstration ?","Remplissez le formulaire de démonstration. L’équipe Bomoi vous contactera pour comprendre votre contexte."]]; return <><PageHero eyebrow="QUESTIONS FRÉQUENTES" title="Les réponses à vos premières questions." intro="Tout ce qu’il faut savoir avant de découvrir Bomoi plus en détail."/><section className="section faq">{qs.map(([q,a],i)=><details key={q} open={i===0}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</section><CTA/></>; }

function WhatsAppButton() {
  const message = encodeURIComponent("Bonjour Bomoi, je souhaite obtenir plus d’informations sur vos solutions.");
  return <SiteLink className="whatsapp-float" href={`https://wa.me/243981863765?text=${message}`} target="_blank" rel="noreferrer" aria-label="Discuter avec Bomoi sur WhatsApp">
    <span className="whatsapp-icon" aria-hidden="true">WA</span><span className="whatsapp-label"><b>Besoin d’aide ?</b><small>Écrivez-nous sur WhatsApp</small></span>
  </SiteLink>;
}

function BackToTopButton() {
  const [visible,setVisible]=useState(false);
  useEffect(()=>{const update=()=>setVisible(scrollY>500);update();addEventListener("scroll",update,{passive:true});return()=>removeEventListener("scroll",update)},[]);
  const backToTop=()=>scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  return <button type="button" className={visible?"back-to-top visible":"back-to-top"} onClick={backToTop} aria-label="Retour en haut de la page" title="Retour en haut"><span aria-hidden="true">↑</span></button>;
}

function PrivacyPage() { return <><PageHero eyebrow="CONFIDENTIALITÉ" title="Politique de confidentialité." intro="Cette page décrit provisoirement les principes de traitement des données du site public Bomoi."/><section className="section legal"><div className="callout warning"><b>Document provisoire</b><p>Le contenu devra être validé juridiquement avant la publication publique du site.</p></div><h2>1. Données collectées</h2><p>Le site pourra collecter les informations fournies volontairement dans les formulaires de contact et de démonstration : identité, coordonnées professionnelles, entreprise et message.</p><h2>2. Finalités</h2><p>Ces données seront utilisées pour répondre aux demandes, organiser des démonstrations, améliorer les services et assurer le suivi de la relation commerciale.</p><h2>3. Conservation et sécurité</h2><p>Les données seront conservées pendant une durée proportionnée à la finalité et protégées par des mesures organisationnelles et techniques adaptées.</p><h2>4. Vos droits</h2><p>Les modalités d’accès, de rectification ou de suppression seront précisées avec les coordonnées officielles du responsable du traitement.</p><h2>5. Contact</h2><p>Pour toute question relative à la confidentialité, écrivez à <SiteLink className="text-link" href={`mailto:${contact.email}`}>{contact.email}</SiteLink>.</p><small>Dernière mise à jour provisoire : 1er août 2026.</small></section></>; }

function AppContent({route}:{route:string}) { switch(route){case"/":return <HomePage/>;case"/a-propos":return <AboutPage/>;case"/modules":return <ModulesPage/>;case"/secteurs":return <SectorsPage/>;case"/avantages":return <AdvantagesPage/>;case"/abonnements":return <PricingPage/>;case"/actualites":return <NewsPage/>;case"/documentation":return <DocumentationPage/>;case"/notes-de-version":return <ReleasesPage/>;case"/partenaires":return <PartnersPage/>;case"/demonstration":return <FormPage type="demo"/>;case"/contact":return <FormPage type="contact"/>;case"/faq":return <FAQPage/>;case"/confidentialite":return <PrivacyPage/>;default:return <><PageHero eyebrow="404" title="Cette page reste à écrire." intro="Revenez à l’accueil ou consultez la documentation Bomoi."/><div className="center section"><SiteLink className="btn" href="/">Retour à l’accueil</SiteLink></div></>}}

export default function BomoiSite({route}:{route:string}) {
  const [theme,setThemeState]=useState("dark");
  const [currentRoute,setCurrentRoute]=useState(route);
  const [navigating,setNavigating]=useState(false);
  useEffect(()=>{
    const normalize=(pathname:string)=>pathname.replace(/\/$/,"")||"/";
    let finishTimer=0;
    const showRoute=(href:string,push:boolean)=>{
      const destination=new URL(href,location.href);
      if(push&&destination.pathname===location.pathname&&destination.search===location.search){scrollTo({top:0,behavior:"smooth"});return;}
      setNavigating(true);
      const update=()=>{
        if(push)history.pushState({},"",destination.href);
        setCurrentRoute(normalize(destination.pathname));
        scrollTo({top:0,behavior:"auto"});
      };
      const documentWithTransition=document as Document&{startViewTransition?:(callback:()=>void)=>unknown};
      requestAnimationFrame(()=>{
        if(documentWithTransition.startViewTransition&&!matchMedia("(prefers-reduced-motion: reduce)").matches)documentWithTransition.startViewTransition(update);else update();
        clearTimeout(finishTimer);finishTimer=window.setTimeout(()=>setNavigating(false),320);
      });
    };
    const navigate=(event:Event)=>showRoute((event as CustomEvent<string>).detail,true);
    const restore=()=>showRoute(location.href,false);
    addEventListener("bomoi:navigate",navigate);addEventListener("popstate",restore);
    return()=>{removeEventListener("bomoi:navigate",navigate);removeEventListener("popstate",restore);clearTimeout(finishTimer)};
  },[]);
  // Synchronize the saved browser preference after hydration.
  useEffect(()=>{const saved=localStorage.getItem("bomoi-theme"); const next=saved||((matchMedia("(prefers-color-scheme: light)").matches)?"light":"dark");setThemeState(next);document.documentElement.dataset.theme=next},[]);
  useEffect(()=>{
    const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root=document.documentElement;
    const revealTargets=[...document.querySelectorAll<HTMLElement>("main > section, .site > section, .section-heading, .feature-card, .partner-logo-card, .product-screen, .sector-grid a, .benefit-grid article, .plan-card, .news-grid article, .module-group, .sector-detail article, .quote-card, .report-card, .youtube-player, .cta")];
    revealTargets.forEach((element,index)=>{
      element.classList.add("reveal-item");
      element.style.setProperty("--reveal-delay",`${Math.min(index%6,5)*70}ms`);
    });
    if(reduceMotion){revealTargets.forEach(element=>element.classList.add("is-visible"));return;}
    root.classList.add("motion-ready");
    const motionScenes=[...document.querySelectorAll<HTMLElement>(".hero-product, .real-workspace-shot, .product-screen, .youtube-player, .trust-story-card")];motionScenes.forEach(scene=>scene.classList.add("motion-scene"));
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}
    }),{threshold:.12,rootMargin:"0px 0px -7% 0px"});
    revealTargets.forEach(element=>observer.observe(element));
    let frame=0;
    const updateScroll=()=>{
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        const max=document.documentElement.scrollHeight-innerHeight;
        root.style.setProperty("--scroll-progress",String(max>0?scrollY/max:0));
        root.style.setProperty("--hero-shift",`${Math.min(scrollY*.08,48)}px`);
        motionScenes.forEach(scene=>{const rect=scene.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));scene.style.setProperty("--motion-shift",`${(progress-.5)*-24}px`);scene.style.setProperty("--motion-scale",String(1.045+Math.abs(progress-.5)*.035))});
        frame=0;
      });
    };
    updateScroll();
    addEventListener("scroll",updateScroll,{passive:true});
    return()=>{observer.disconnect();removeEventListener("scroll",updateScroll);if(frame)cancelAnimationFrame(frame);root.classList.remove("motion-ready");motionScenes.forEach(scene=>scene.classList.remove("motion-scene"))};
  },[currentRoute]);
  const setTheme=(next:string)=>{setThemeState(next);document.documentElement.dataset.theme=next;localStorage.setItem("bomoi-theme",next)};
  const docs=currentRoute==="/documentation";
  return <div className="site"><div className="scroll-progress" aria-hidden="true"/><div className={navigating?"route-loader active":"route-loader"} role="status" aria-live="polite" aria-label={navigating?"Chargement de la page":""}><span/><i/><i/><i/></div><Header theme={theme} setTheme={setTheme} route={currentRoute}/><AppContent route={currentRoute}/>{!docs&&<Footer/>}<BackToTopButton/><WhatsAppButton/></div>;
}
