export type DownloadApplication = "bomoi-pos" | "bomoi-stock-client";
export const statisticsApi = "/api/downloads/";

export function validCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export async function readDownloadCount(
  application: DownloadApplication,
  signal: AbortSignal,
): Promise<number> {
  const response = await fetch(statisticsApi, {
    credentials: "omit",
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error("Compteur indisponible");
  const body = await response.json();
  if (!validCount(body?.counts?.[application]))
    throw new Error("Compteur invalide");
  return body.counts[application];
}

export async function recordDownload(
  application: DownloadApplication,
  requestId: string,
): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${statisticsApi}${application}/`, {
      method: "POST",
      credentials: "omit",
      keepalive: true,
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    if (!response.ok) throw new Error("Compteur indisponible");
    const body = await response.json();
    if (body?.application !== application || !validCount(body.count))
      throw new Error("Compteur invalide");
    return body.count;
  } finally {
    clearTimeout(timer);
  }
}
