import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";
import {
  createDownloadCounters,
  CounterRateLimitError,
  dataDirectory,
} from "../server/download-counters.mjs";
import { createDownloadHandlers } from "../server/download-http.mjs";
import { launchSite } from "./site-server.mjs";

const temporary = () =>
  mkdtempSync(path.join(os.tmpdir(), "bomoi-download-store-"));

test("site counters persist across restart, stay independent and deduplicate retries", () => {
  const directory = temporary();
  let store;
  try {
    store = createDownloadCounters(directory);
    assert.deepEqual(store.read(), { "bomoi-pos": 0, "bomoi-stock-client": 0 });
    const id = crypto.randomUUID();
    assert.equal(store.record("bomoi-pos", id), 1);
    store.close();
    store = createDownloadCounters(directory);
    assert.equal(store.record("bomoi-pos", id.toUpperCase()), 1);
    assert.equal(store.record("bomoi-stock-client", id), 1);
    assert.equal(store.record("bomoi-pos", crypto.randomUUID()), 2);
  } finally {
    store?.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("independent Node processes cannot lose concurrent increments", async () => {
  const directory = temporary();
  const store = createDownloadCounters(directory);
  store.close();
  const moduleUrl = new URL("../server/download-counters.mjs", import.meta.url)
    .href;
  try {
    await Promise.all(
      Array.from(
        { length: 4 },
        () =>
          new Promise((resolve, reject) => {
            const child = spawn(
              process.execPath,
              [
                "--input-type=module",
                "-e",
                `
        const { createDownloadCounters } = await import(process.argv[1]);
        const store = createDownloadCounters(process.argv[2]);
        for (let i=0;i<25;i++) store.record('bomoi-pos', crypto.randomUUID());
        store.close();`,
                moduleUrl,
                directory,
              ],
              { stdio: ["ignore", "ignore", "pipe"] },
            );
            let logs = "";
            child.stderr.on("data", (chunk) => {
              logs = (logs + chunk).slice(-2000);
            });
            child.once("error", reject);
            child.once("exit", (code) =>
              code === 0 ? resolve() : reject(new Error(logs)),
            );
          }),
      ),
    );
    const reopened = createDownloadCounters(directory);
    assert.equal(reopened.read()["bomoi-pos"], 100);
    reopened.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("expired receipts are pruned without losing lifetime totals and limits roll back", () => {
  const directory = temporary();
  let instant = Date.now();
  const store = createDownloadCounters(directory, {
    now: () => instant,
    limit: 2,
  });
  try {
    const id = crypto.randomUUID();
    store.record("bomoi-pos", id);
    store.record("bomoi-stock-client", crypto.randomUUID());
    assert.throws(
      () => store.record("bomoi-pos", crypto.randomUUID()),
      CounterRateLimitError,
    );
    assert.equal(store.record("bomoi-pos", id), 1);
    assert.deepEqual(store.read(), { "bomoi-pos": 1, "bomoi-stock-client": 1 });
    instant += 11 * 60000;
    assert.equal(store.record("bomoi-pos", id), 2);
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("corrupt storage is rejected without resetting or replacing it", () => {
  const directory = temporary();
  const file = path.join(directory, "downloads.sqlite");
  try {
    writeFileSync(file, "invalid SQLite data");
    assert.throws(() => createDownloadCounters(directory));
    assert.equal(readFileSync(file, "utf8"), "invalid SQLite data");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

const request = (body, options = {}) =>
  new Request("https://bomoi.cd/api/downloads/bomoi-pos/", {
    method: "POST",
    headers: {
      origin: "https://bomoi.cd",
      "content-type": "application/json",
      ...options.headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

test("API rejects malformed bodies and unauthorized origins before accessing storage", async () => {
  const api = createDownloadHandlers(() => {
    throw new Error("Storage must not be accessed");
  });
  const id = { requestId: crypto.randomUUID() };
  for (const [body, options, expected] of [
    [id, { headers: { origin: "https://other.example" } }, 403],
    [id, { headers: { "content-type": "text/plain" } }, 415],
    ["invalid json", {}, 400],
    [null, {}, 400],
    [{ requestId: "wrong" }, {}, 400],
    [id, { headers: { "content-length": "2048" } }, 413],
    ["a".repeat(2048), {}, 413],
  ])
    assert.equal(
      (await api.POST(request(body, options), "bomoi-pos")).status,
      expected,
    );
  assert.equal((await api.POST(request(id), "unknown")).status, 404);
});

test("counter failures return 503 and never fabricated totals", async () => {
  const original = console.error;
  console.error = () => {};
  try {
    const api = createDownloadHandlers(() => {
      throw new Error("disk failure");
    });
    const response = await api.GET();
    assert.equal(response.status, 503);
    assert.equal((await response.json()).counts, undefined);
    assert.equal(
      (await api.POST(request({ requestId: crypto.randomUUID() }), "bomoi-pos"))
        .status,
      503,
    );
  } finally {
    console.error = original;
  }
});

test("packaged Node site serves pages, its own API, PDFs and resumable APKs together", async () => {
  const site = await launchSite();
  try {
    const get = () => fetch(site.base + "/api/downloads/");
    let response = await get();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual((await response.json()).counts, {
      "bomoi-pos": 0,
      "bomoi-stock-client": 0,
    });
    const id = crypto.randomUUID();
    for (let i = 0; i < 2; i++) {
      response = await fetch(site.base + "/api/downloads/bomoi-pos/", {
        method: "POST",
        headers: {
          origin: "https://bomoi.cd",
          "content-type": "application/json",
        },
        body: JSON.stringify({ requestId: id }),
      });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).count, 1);
    }
    response = await fetch(site.base + "/api/downloads/bomoi-pos/", {
      method: "POST",
      headers: {
        origin: "https://other.example",
        "content-type": "application/json",
      },
      body: JSON.stringify({ requestId: crypto.randomUUID() }),
    });
    assert.equal(response.status, 403);
    for (const application of ["bomoi-pos", "bomoi-stock-client"])
      assert.equal(
        (await fetch(site.base + "/telechargements/" + application + "/"))
          .status,
        200,
      );
    response = await fetch(
      site.base + "/documentation/bomoi-stock-client-manuel-utilisateur.pdf",
      { headers: { range: "bytes=0-4" } },
    );
    assert.equal(response.status, 206);
    assert.equal(await response.text(), "%PDF-");
    const release = JSON.parse(
      readFileSync(
        new URL("../app/stock-client-release.json", import.meta.url),
        "utf8",
      ),
    );
    response = await fetch(site.base + release.path, {
      headers: { range: "bytes=0-3" },
    });
    assert.equal(response.status, 206);
    assert.deepEqual(
      [...new Uint8Array(await response.arrayBuffer())],
      [80, 75, 3, 4],
    );
    assert.deepEqual((await (await get()).json()).counts, {
      "bomoi-pos": 1,
      "bomoi-stock-client": 0,
    });
    response = await fetch(site.base + "/server.js");
    assert.equal(response.status, 404);
    response = await fetch(site.base + "/downloads.sqlite");
    assert.equal(response.status, 404);
  } finally {
    await site.stop();
  }
});

test("runtime data cannot be configured inside the served website", () => {
  const original = process.env.BOMOI_DOWNLOAD_DATA_DIR;
  try {
    process.env.BOMOI_DOWNLOAD_DATA_DIR = path.join(
      process.cwd(),
      "public",
      "data",
    );
    assert.throws(() => dataDirectory());
    process.env.BOMOI_DOWNLOAD_DATA_DIR = os.tmpdir();
    assert.equal(dataDirectory(), path.resolve(os.tmpdir()));
  } finally {
    if (original === undefined) delete process.env.BOMOI_DOWNLOAD_DATA_DIR;
    else process.env.BOMOI_DOWNLOAD_DATA_DIR = original;
  }
});

test("unknown applications and empty receipts cannot change a total", () => {
  const directory = temporary();
  const store = createDownloadCounters(directory);
  try {
    assert.throws(
      () => store.record("../unknown", crypto.randomUUID()),
      TypeError,
    );
    assert.throws(
      () => store.record("bomoi-pos", "00000000-0000-0000-0000-000000000000"),
      TypeError,
    );
    assert.deepEqual(store.read(), { "bomoi-pos": 0, "bomoi-stock-client": 0 });
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
