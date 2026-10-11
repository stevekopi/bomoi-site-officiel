import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

import { readFile } from "node:fs/promises";

test("manual route renders twenty chapters, user troubleshooting, and a PDF download", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  const response = await worker.fetch(new Request("http://localhost/documentation/bomoi-pos/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Votre quotidien avec/);
  assert.match(html, /bomoi-pos-manuel-utilisateur\.pdf/);
  assert.match(html, /Database is locked/);
  assert.match(html, /Stock insuffisant/);
  assert.match(html, /Ventes non synchronisées/);
  assert.match(html, /pos-manual-search/);
  assert.equal((html.match(/class="pos-manual-chapter"/g) ?? []).length, 20);
});

test("manual download is a committed PDF and chapter anchors are unique", async () => {
  const pdf = await readFile(new URL("../public/documentation/bomoi-pos-manuel-utilisateur.pdf", import.meta.url));
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.ok(pdf.length > 50000);
  const manual = JSON.parse(await readFile(new URL("../app/manual/pos-manual.fr.json", import.meta.url), "utf8"));
  assert.equal(new Set(manual.sections.map(section => section.id)).size, manual.sections.length);
  assert.equal(manual.sections.length, 20);
});
