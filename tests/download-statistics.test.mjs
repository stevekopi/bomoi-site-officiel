import test from "node:test";
import assert from "node:assert/strict";
import {
  readDownloadCount,
  recordDownload,
  validCount,
} from "../app/downloads/statistics.ts";

const originalFetch = globalThis.fetch;
test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("count validation accepts real zero and rejects missing, negative or imprecise totals", () => {
  for (const count of [0, 1, 123456]) assert.equal(validCount(count), true);
  for (const count of [
    undefined,
    null,
    "12",
    -1,
    1.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ])
    assert.equal(validCount(count), false);
});
test("reads the selected application without credentials or cached totals", async () => {
  globalThis.fetch = async (url, options) => {
    assert.match(url, /^\/api\/downloads\/$/);
    assert.equal(options.credentials, "omit");
    assert.equal(options.cache, "no-store");
    return Response.json({
      counts: { "bomoi-pos": 18, "bomoi-stock-client": 0 },
    });
  };
  assert.equal(
    await readDownloadCount("bomoi-stock-client", new AbortController().signal),
    0,
  );
  assert.equal(
    await readDownloadCount("bomoi-pos", new AbortController().signal),
    18,
  );
});
test("never converts an API failure or missing value into a fake zero", async () => {
  globalThis.fetch = async () => new Response("unavailable", { status: 503 });
  await assert.rejects(() =>
    readDownloadCount("bomoi-pos", new AbortController().signal),
  );
  globalThis.fetch = async () => Response.json({ counts: {} });
  await assert.rejects(() =>
    readDownloadCount("bomoi-pos", new AbortController().signal),
  );
});
test("records an idempotent request and validates the returned application", async () => {
  globalThis.fetch = async (url, options) => {
    assert.match(url, /\/bomoi-pos\/$/);
    assert.equal(options.method, "POST");
    assert.equal(options.keepalive, true);
    assert.equal(options.credentials, "omit");
    assert.equal(JSON.parse(options.body).requestId, "same-request");
    return Response.json({ application: "bomoi-pos", count: 19 });
  };
  assert.equal(await recordDownload("bomoi-pos", "same-request"), 19);
  globalThis.fetch = async () =>
    Response.json({ application: "bomoi-stock-client", count: 19 });
  await assert.rejects(() => recordDownload("bomoi-pos", "same-request"));
  globalThis.fetch = async () => new Response(null, { status: 429 });
  await assert.rejects(() => recordDownload("bomoi-pos", "same-request"));
});
