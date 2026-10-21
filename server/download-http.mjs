import {
  applications,
  validReceipt,
  getDownloadCounters,
  CounterRateLimitError,
} from "./download-counters.mjs";

const json = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

export function createDownloadHandlers(getCounters = getDownloadCounters) {
  return {
    async GET() {
      try {
        return json({ counts: getCounters().read() });
      } catch (error) {
        console.error("Download statistics storage unavailable", error);
        return json({ error: "Compteur indisponible" }, 503);
      }
    },
    async POST(request, application) {
      if (!applications.includes(application))
        return json({ error: "Application inconnue" }, 404);
      const origin = request.headers.get("origin");
      const url = new URL(request.url);
      const local =
        process.env.NODE_ENV !== "production" &&
        origin === url.origin &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
      if (
        !["https://bomoi.cd", "https://www.bomoi.cd"].includes(origin) &&
        !local
      )
        return json({ error: "Origine refusée" }, 403);
      if (
        request.headers
          .get("content-type")
          ?.split(";")[0]
          .trim()
          .toLowerCase() !== "application/json"
      )
        return json({ error: "JSON requis" }, 415);
      if (Number(request.headers.get("content-length")) > 1024)
        return json({ error: "Requête trop volumineuse" }, 413);
      let body;
      try {
        const reader = request.body?.getReader();
        if (!reader) return json({ error: "Requête invalide" }, 400);
        const chunks = [];
        let length = 0;
        try {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            length += chunk.value.byteLength;
            if (length > 1024) {
              await reader.cancel();
              return json({ error: "Requête trop volumineuse" }, 413);
            }
            chunks.push(Buffer.from(chunk.value));
          }
        } finally {
          reader.releaseLock();
        }
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        return json({ error: "Requête invalide" }, 400);
      }
      if (!validReceipt(body?.requestId))
        return json({ error: "Identifiant invalide" }, 400);
      try {
        return json({
          application,
          count: getCounters().record(application, body.requestId),
        });
      } catch (error) {
        if (error instanceof CounterRateLimitError)
          return json({ error: "Veuillez réessayer plus tard" }, 429);
        console.error("Download statistics storage unavailable", error);
        return json({ error: "Compteur indisponible" }, 503);
      }
    },
  };
}
export const downloadHandlers = createDownloadHandlers();
