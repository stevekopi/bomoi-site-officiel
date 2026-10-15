import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders production HTML without temporary development preview metadata", async () => {
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
  assert.doesNotMatch(await response.text(), developmentPreviewMeta);
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

async function fetchPage(path) {
  const { default: worker } = await import("../dist/server/index.js");
  return worker.fetch(new Request(`http://localhost${path}/`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} });
}
test("documentation hub offers Stock, Exchange, POS and the planned School space", async () => {
  const response = await fetchPage("/documentation"); assert.equal(response.status, 200);
  const html = await response.text();
  for (const product of ["stock", "exchange", "pos", "school"]) assert.ok(html.includes(`/documentation/bomoi-${product}`), product);
  assert.match(html, /documentation-search/); assert.match(html, /À venir/);
  assert.doesNotMatch(html, /href="\/documentation\/bomoi-erp"/);
  const text = html.replace(/<!--.*?-->/g, "");
  assert.match(text, /21 chapitres/); assert.match(text, /13 chapitres/);
});
test("Stock retains all existing chapters and old ERP deep links point canonically to Stock", async () => {
  const stock = JSON.parse(await readFile(new URL("../app/manual/stock-manual.fr.json", import.meta.url), "utf8"));
  assert.equal(stock.sections.length, 13);
  for (const chapter of stock.sections) {
    const response = await fetchPage(`/documentation/bomoi-erp/${chapter.id}`); assert.equal(response.status, 200, chapter.id);
    const html = await response.text();
    assert.ok(html.includes(chapter.title + " | Manuel Bomoi Stock"));
    assert.ok(html.includes(`https://bomoi.cd/documentation/bomoi-stock/${chapter.id}`));
    assert.ok(html.includes("/documentation/bomoi-stock-manuel-utilisateur.pdf"));
  }
  const index = await fetchPage("/documentation/bomoi-stock");
  assert.equal(((await index.text()).match(/class="pos-manual-card"/g) ?? []).length, 13);
});
test("Exchange exposes independent chapters with matching metadata, navigation and PDF", async () => {
  const manual = JSON.parse(await readFile(new URL("../app/manual/exchange-manual.fr.json", import.meta.url), "utf8"));
  assert.equal(manual.sections.length, 21); assert.equal(new Set(manual.sections.map(section => section.id)).size, 21);
  const index = await fetchPage("/documentation/bomoi-exchange"); const html = await index.text();
  assert.equal(index.status, 200); assert.equal((html.match(/class="pos-manual-card"/g) ?? []).length, 21);
  for (const [i, chapter] of manual.sections.entries()) {
    const response = await fetchPage(`/documentation/bomoi-exchange/${chapter.id}`); assert.equal(response.status, 200, chapter.id);
    const page = await response.text();
    assert.ok(page.includes(chapter.title + " | Manuel Bomoi Exchange"));
    assert.match(page, /aria-current="page"/); assert.match(page, /bomoi-exchange-manuel-utilisateur\.pdf/);
    assert.equal((page.match(/class="pos-manual-chapter"/g) ?? []).length, 1);
    if (i) assert.match(page, /Précédent/); if (i < manual.sections.length - 1) assert.match(page, /Suivant/);
  }
});
test("School is clearly planned and has no unavailable manual download", async () => {
  const response = await fetchPage("/documentation/bomoi-school"); const html = await response.text();
  assert.equal(response.status, 200); assert.match(html, /DOCUMENTATION EN PRÉPARATION/);
  assert.match(html, /Aucun manuel opérationnel ni date de disponibilité/);
  assert.doesNotMatch(html, /bomoi-school-manuel-utilisateur\.pdf/);
  assert.equal((await fetchPage("/documentation/bomoi-school/inscriptions")).status, 404);
});
test("unknown chapters are rejected for Stock, Exchange and the ERP compatibility routes", async () => {
  for (const product of ["stock", "exchange", "erp"]) {
    assert.equal((await fetchPage(`/documentation/bomoi-${product}/unknown-chapter`)).status, 404);
    assert.equal((await fetchPage(`/documentation/bomoi-${product}/connexion/extra`)).status, 404);
  }
});
test("Stock and Exchange downloads exist and the ERP PDF remains a Stock alias", async () => {
  const stock = await readFile(new URL("../public/documentation/bomoi-stock-manuel-utilisateur.pdf", import.meta.url));
  const exchange = await readFile(new URL("../public/documentation/bomoi-exchange-manuel-utilisateur.pdf", import.meta.url));
  const legacy = await readFile(new URL("../public/documentation/bomoi-erp-manuel-utilisateur.pdf", import.meta.url));
  for (const pdf of [stock, exchange]) { assert.equal(pdf.subarray(0, 5).toString(), "%PDF-"); assert.ok(pdf.length > 20000); }
  assert.deepEqual(legacy, stock);
});
