import { notFound } from "next/navigation";
import manual from "../manual/pos-manual.fr.json";
import erpManual from "../manual/erp-manual.fr.json";
import BomoiSite from "../BomoiSite";

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
  "documentation",
  "documentation/bomoi-erp",
  ...erpManual.sections.map(section => `documentation/bomoi-erp/${section.id}`),
  "documentation/bomoi-pos",
  ...manual.sections.map(section => `documentation/bomoi-pos/${section.id}`),
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
  if(route==="telechargements/bomoi-pos")return {title:"Télécharger Bomoi POS pour Android | Bomoi",description:"Téléchargez l’APK Android signé de Bomoi POS. Installation directe sur téléphone, tablette et terminal POS. Play Store et App Store prochainement.",alternates:{canonical:"https://bomoi.cd/telechargements/bomoi-pos"}};
  if (route === "documentation/bomoi-erp" || route.startsWith("documentation/bomoi-erp/")) {
    const chapter = erpManual.sections.find(section => route === `documentation/bomoi-erp/${section.id}`);
    return { title: chapter ? `${chapter.title} | Manuel Bomoi ERP` : "Manuel utilisateur Bomoi ERP | Bomoi", description: chapter?.intro ?? "Guide d’utilisation du logiciel web Bomoi ERP : stocks, ventes, achats, caisses, rapports et conflits POS.", alternates: { canonical: `https://bomoi.cd/${route}` } };
  }
  if (route !== "documentation/bomoi-pos" && !route.startsWith("documentation/bomoi-pos/")) return {};
  const chapter = manual.sections.find(section => route === `documentation/bomoi-pos/${section.id}`);
  return {
    title: chapter ? `${chapter.title} | Manuel Bomoi POS` : "Manuel utilisateur Bomoi POS | Bomoi",
    description: chapter?.intro ?? "Guide d’utilisation Bomoi POS : ventes, paiements multidevises, reçus, travail hors ligne et dépannage. Manuel PDF téléchargeable.",
    alternates: { canonical: `https://bomoi.cd/${route}` },
  };
}

export function generateStaticParams() {
  return staticRoutes.map((route) => ({ slug: route.split("/") }));
}

export default async function CatchAll({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (slug[0] === "documentation" && slug[1] === "bomoi-pos" && slug.length > 2 &&
      (slug.length !== 3 || !manual.sections.some(section => section.id === slug[2]))) notFound();
  if (slug[0] === "documentation" && slug[1] === "bomoi-erp" && slug.length > 2 && (slug.length !== 3 || !erpManual.sections.some(section => section.id === slug[2]))) notFound();
  return <BomoiSite route={`/${slug.join("/")}`} />;
}
