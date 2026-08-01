import BomoiSite from "../BomoiSite";

export default async function CatchAll({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <BomoiSite route={`/${slug.join("/")}`} />;
}
