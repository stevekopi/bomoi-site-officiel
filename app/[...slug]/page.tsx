import { notFound } from "next/navigation";
import { manualCatalog, manualRoutes, legacyStockRoutes, resolveManualRoute } from "../manual/catalog";
import BomoiSite from "../BomoiSite";

export const dynamicParams = false;

const staticRoutes = [
  "a-propos",
  "produits",
  "produits/bomoi-stock",
  "produits/bomoi-immo",
  "produits/bomoi-ged",
  "modules",
  "secteurs",
  "avantages",
  "abonnements",
  "actualites",
  "telechargements/bomoi-pos",
  "telechargements/bomoi-stock-client",
  "documentation",
  ...manualRoutes,
  ...legacyStockRoutes,
  "documentation/bomoi-school",
  "notes-de-version",
  "partenaires",
  "demonstration",
  "contact",
  "faq",
  "confidentialite",
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const route = slug.join("/");
  if(route==="telechargements/bomoi-stock-client")return {title:"Télécharger Bomoi Stock - Espace client pour Android | Bomoi",description:"Téléchargez l’APK Android signé de Bomoi Stock - Espace client et consultez vos commandes, livraisons, paiements et relevés personnels.",alternates:{canonical:"https://bomoi.cd/telechargements/bomoi-stock-client"}};
  if(route==="telechargements/bomoi-pos")return {title:"Télécharger Bomoi-Stock POS pour Android | Bomoi",description:"Téléchargez l’APK Android signé de Bomoi-Stock POS. Installation directe sur téléphone, tablette et terminal POS. Play Store et App Store prochainement.",alternates:{canonical:"https://bomoi.cd/telechargements/bomoi-pos"}};
  if (route === "documentation/bomoi-school") return { title: "Bomoi School · Documentation à venir | Bomoi", description: "Espace réservé à la documentation du futur module scolaire Bomoi School. Guides en préparation.", alternates: { canonical: "https://bomoi.cd/documentation/bomoi-school" } };
  if (route === "documentation") return { title: "Documentation Bomoi Stock, Espace client, Exchange, POS et School | Bomoi", description: "Guides et manuels utilisateurs Bomoi Stock, espace client mobile, Bomoi Exchange et Bomoi-Stock POS. Espace Bomoi School à venir.", alternates: { canonical: "https://bomoi.cd/documentation" } };
  const resolved = resolveManualRoute(route);
  if (!resolved) return {};
  const metadata = manualCatalog[resolved.product];
  const chapter = metadata.data.sections.find(section => section.id === resolved.chapterId);
  const canonical = `https://bomoi.cd/documentation/bomoi-${resolved.product}${resolved.chapterId ? `/${resolved.chapterId}` : ""}`;
  return { title: chapter ? `${chapter.title} | Manuel ${metadata.name}` : `Manuel utilisateur ${metadata.name} | Bomoi`, description: chapter?.intro ?? metadata.description, alternates: { canonical } };
}

export function generateStaticParams() {
  return staticRoutes.map((route) => ({ slug: route.split("/") }));
}

export default async function CatchAll({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const resolved = resolveManualRoute(slug.join("/"));
  if (resolved && (slug.length > 3 || (resolved.chapterId && !manualCatalog[resolved.product].data.sections.some(section => section.id === resolved.chapterId)))) notFound();
  if (slug[0] === "documentation" && slug[1] === "bomoi-school" && slug.length !== 2) notFound();
  return <BomoiSite route={`/${slug.join("/")}`} />;
}
