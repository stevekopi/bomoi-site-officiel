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
  "documentation",
  "documentation/bomoi-pos",
  "notes-de-version",
  "partenaires",
  "demonstration",
  "contact",
  "faq",
  "confidentialite",
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (slug.join("/") !== "documentation/bomoi-pos") return {};
  return {
    title: "Manuel utilisateur Bomoi POS | Bomoi",
    description: "Guide d’utilisation Bomoi POS : ventes, paiements multidevises, reçus, travail hors ligne et dépannage. Manuel PDF téléchargeable.",
    alternates: { canonical: "https://bomoi.cd/documentation/bomoi-pos" },
  };
}

export function generateStaticParams() {
  return staticRoutes.map((route) => ({ slug: route.split("/") }));
}

export default async function CatchAll({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <BomoiSite route={`/${slug.join("/")}`} />;
}
