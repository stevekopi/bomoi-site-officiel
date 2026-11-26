import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Read the exported files directly, just as a static host selects index.html.
export async function launchSite() {
  const output = path.resolve(fileURLToPath(new URL("../out/", import.meta.url)));
  return {
    async stop() {},
    async fetch(request) {
      const pathname = decodeURIComponent(new URL(request.url).pathname);
      let file = path.resolve(output, "." + pathname);
      if (file !== output && !file.startsWith(output + path.sep))
        return new Response("Not found", { status: 404 });
      try {
        if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
        const body = await readFile(file);
        const contentType = file.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream";
        return new Response(body, { headers: { "Content-Type": contentType } });
      } catch (error) {
        if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
        return new Response(await readFile(path.join(output, "404.html")), {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    },
  };
}
