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

test("manual index links to twenty autonomous pages and a PDF download", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  const response = await worker.fetch(new Request("http://localhost/documentation/bomoi-pos/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Votre quotidien avec/);
  assert.match(html, /bomoi-pos-manuel-utilisateur\.pdf/);
  assert.match(html, /pos-manual-search/);
  assert.equal((html.match(/class="pos-manual-card"/g) ?? []).length, 20);
  assert.equal((html.match(/class="pos-manual-chapter"/g) ?? []).length, 0);
  assert.match(html, /href="\/documentation\/bomoi-pos\/parametres"/);
});

test("manual download is a committed PDF and chapter anchors are unique", async () => {
  const pdf = await readFile(new URL("../public/documentation/bomoi-pos-manuel-utilisateur.pdf", import.meta.url));
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.ok(pdf.length > 50000);
  const manual = JSON.parse(await readFile(new URL("../app/manual/pos-manual.fr.json", import.meta.url), "utf8"));
  assert.equal(new Set(manual.sections.map(section => section.id)).size, manual.sections.length);
  assert.equal(manual.sections.length, 20);
});


test("manual chapters render independently with their own title and previous/next navigation", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  const manual = JSON.parse(await readFile(new URL("../app/manual/pos-manual.fr.json", import.meta.url), "utf8"));
  for (const [index, chapter] of manual.sections.entries()) {
    const response = await worker.fetch(new Request(`http://localhost/documentation/bomoi-pos/${chapter.id}/`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
    assert.equal(response.status, 200, chapter.id);
    const html = await response.text();
    assert.equal((html.match(/class="pos-manual-chapter"/g) ?? []).length, 1, chapter.id);
    assert.equal((html.match(/class="pos-manual-card"/g) ?? []).length, 0, chapter.id);
    assert.match(html, /aria-current="page"/);
    assert.ok(html.includes(chapter.title + " | Manuel Bomoi POS"));
    assert.match(html, /bomoi-pos-manuel-utilisateur\.pdf/);
    if (index > 0) assert.match(html, /Précédent/);
    if (index < manual.sections.length - 1) assert.match(html, /Suivant/);
  }
});

test("unknown manual chapter returns 404", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  const response = await worker.fetch(new Request("http://localhost/documentation/bomoi-pos/unknown-chapter/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 404);
});
