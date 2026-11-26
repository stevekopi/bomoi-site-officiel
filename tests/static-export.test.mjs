import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { access, cp, mkdir, mkdtemp, opendir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { launchSite } from "./site-server.mjs";

const execute = promisify(execFile);

test("static export includes legal pages, assets and IIS configuration without server routes", async () => {
  const site = await launchSite();
  for (const [route, title] of [
    ["/confidentialite/bs-client/", "Politique de confidentialité de BS Client"],
    ["/conditions-utilisation/bs-client/", "Conditions d’utilisation de BS Client"],
  ]) {
    const response = await site.fetch(new Request("https://bomoi.cd" + route));
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(title));
    assert.ok(html.includes("https://bomoi.cd" + route));
    assert.ok(html.includes("contact@bomoi.cd"));
    assert.match(html, /\/_next\/static\//);
  }
  for (const route of ["/page-inconnue/", "/api/downloads/", "/api/downloads/bomoi-pos/"]) {
    const response = await site.fetch(new Request("https://bomoi.cd" + route));
    assert.equal(response.status, 404);
  }
  for (const file of ["server.js", "package.json", "api/downloads/index.html", "node_modules", ".next"]) {
    await assert.rejects(access(new URL("../out/" + file, import.meta.url)), { code: "ENOENT" });
  }
  const config = await readFile(new URL("../out/web.config", import.meta.url), "utf8");
  assert.match(config, /<add value="index.html"\s*\/>/);
  assert.match(config, /statusCode="404" path="\/404.html"/);
  assert.doesNotMatch(config, /127\.0\.0\.1|3080|type="Rewrite"|\.apk/);
});

test("IIS packaging retains the output directory and removes obsolete server files", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "bomoi-static-package-"));
  let opened;
  try {
    const output = path.join(directory, "out");
    await mkdir(path.join(directory, "scripts"));
    await mkdir(path.join(directory, "iis"));
    await mkdir(path.join(directory, ".iis-export"), { recursive: true });
    await mkdir(path.join(output, "node_modules"), { recursive: true });
    await mkdir(path.join(output, "old-page"));
    await writeFile(path.join(directory, ".iis-export/index.html"), "<h1>Bomoi</h1>");
    await writeFile(path.join(directory, ".iis-export/404.html"), "<h1>404</h1>");
    await writeFile(path.join(directory, "iis/web.config"), "<configuration/>");
    await writeFile(path.join(output, "server.js"), "obsolete");
    await writeFile(path.join(output, "old-page/index.html"), "obsolete");
    await cp(new URL("../scripts/package-iis.mjs", import.meta.url), path.join(directory, "scripts/package-iis.mjs"));
    const before = await stat(output);
    opened = await opendir(output);
    await execute(process.execPath, [path.join(directory, "scripts/package-iis.mjs")]);
    assert.equal((await stat(output)).ino, before.ino);
    assert.equal(await readFile(path.join(output, "index.html"), "utf8"), "<h1>Bomoi</h1>");
    assert.equal(await readFile(path.join(output, "web.config"), "utf8"), "<configuration/>");
    for (const file of ["server.js", "node_modules", "old-page"])
      await assert.rejects(access(path.join(output, file)), { code: "ENOENT" });

    // A partial export cannot overwrite a working site.
    await rm(path.join(directory, ".iis-export/404.html"));
    await writeFile(path.join(directory, ".iis-export/index.html"), "partial");
    await assert.rejects(execute(process.execPath, [path.join(directory, "scripts/package-iis.mjs")]));
    assert.equal(await readFile(path.join(output, "index.html"), "utf8"), "<h1>Bomoi</h1>");
  } finally {
    await opened?.close();
    await rm(directory, { recursive: true, force: true });
  }
});
