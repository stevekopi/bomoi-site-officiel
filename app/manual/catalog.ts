import client from "./stock-client-manual.fr.json";
import pos from "./pos-manual.fr.json";
import stock from "./stock-manual.fr.json";
import exchange from "./exchange-manual.fr.json";

export const manualCatalog = {
  "stock-client": { name: "Bomoi Stock - Espace client", data: client, platform: "ESPACE CLIENT MOBILE", description: "Commandes, achats, livraisons, paiements, comptes et relevés. Un guide pour consulter son espace personnel et personnaliser l’application.", safety: "Votre espace personnel, vos informations.", precaution: "Vérifiez l’entreprise et la devise du compte. Pour une correction financière, contactez l’entreprise avec la référence concernée.", search: "Ex. relevé, photo, livraison, notifications…" },
  stock: { name: "Bomoi Stock", data: stock, platform: "APPLICATION WEB", description: "Articles, stocks, ventes, achats, caisses, rapports et traitement des conflits POS.", safety: "Une opération, un historique.", precaution: "Avant de ressaisir une opération après une erreur, recherchez-la et vérifiez son état.", search: "Ex. inventaire, reçu, caisse…" },
  exchange: { name: "Bomoi Exchange", data: exchange, platform: "BUREAU DE CHANGE", description: "Achats et ventes de devises, valorisation CDF, caisses, partenaires, comptages et rapports.", safety: "Contrôlez les deux devises avant confirmation.", precaution: "Vérifiez les quantités, le taux, la contre-valeur et les caisses. Après une réponse perdue, recherchez l’opération avant de remettre ou d’encaisser à nouveau les fonds.", search: "Ex. achat USD, valorisation, dépôt…" },
  pos: { name: "Bomoi POS", data: pos, platform: "ANDROID & IOS", description: "Vendre, encaisser, imprimer et travailler hors ligne. Toutes les étapes, les cas particuliers et les solutions aux incidents dans un seul manuel.", safety: "Une vente, un seul encaissement.", precaution: "Si l’impression ou la synchronisation échoue, retrouvez d’abord l’opération dans Historique. Conservez les données de l’appareil.", search: "Ex. reçu, stock insuffisant…" },
} as const;
export type ManualProduct = keyof typeof manualCatalog;
export function resolveManualRoute(route: string): { product: ManualProduct; chapterId?: string } | null {
  const parts = route.replace(/^\/+|\/+$/g, "").split("/");
  if (parts[0] !== "documentation") return null;
  const alias = parts[1]?.replace(/^bomoi-/, "");
  const product = alias === "erp" ? "stock" : alias;
  if (!product || !Object.hasOwn(manualCatalog, product)) return null;
  return { product: product as ManualProduct, chapterId: parts[2] };
}
export const manualRoutes = Object.entries(manualCatalog).flatMap(([product, manual]) => [
  `documentation/bomoi-${product}`, ...manual.data.sections.map(section => `documentation/bomoi-${product}/${section.id}`),
]);
export const legacyStockRoutes = ["documentation/bomoi-erp", ...stock.sections.map(section => `documentation/bomoi-erp/${section.id}`)];
