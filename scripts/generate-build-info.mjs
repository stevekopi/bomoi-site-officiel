import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const targetNames = { sites: "OpenAI Sites", iis: "VPS / IIS" };
const target = targetNames[process.argv[2]] ?? "Développement";
const packageData = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
let commit = "local";
try {
  commit = execFileSync("git", ["rev-parse", "--short=8", "HEAD"], { encoding: "utf8" }).trim();
} catch {}

const buildInfo = {
  version: `v${packageData.version}+${commit}`,
  commit,
  target,
  builtAt: new Date().toISOString(),
};

await mkdir(new URL("../public/", import.meta.url), { recursive: true });
await writeFile(new URL("../public/build-info.json", import.meta.url), `${JSON.stringify(buildInfo, null, 2)}\n`);
console.log(`${buildInfo.version} · ${target} · ${buildInfo.builtAt}`);
