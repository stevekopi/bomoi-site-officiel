import { access, cp, lstat, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exported = path.join(root, ".iis-export");
const output = path.join(root, "out");

// Validate the completed export before touching the IIS directory.
await access(path.join(exported, "index.html"));
await access(path.join(exported, "404.html"));
try {
  if ((await lstat(output)).isSymbolicLink())
    throw new Error("Le dossier out doit être un répertoire local du projet.");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await mkdir(output, { recursive: true });
await cp(exported, output, { recursive: true, force: true });

// Remove obsolete generated files while retaining the directory opened by IIS.
async function removeObsolete(source, target) {
  const expected = new Map(
    (await readdir(source, { withFileTypes: true })).map(entry => [entry.name, entry]),
  );
  for (const entry of await readdir(target, { withFileTypes: true })) {
    if (target === output && entry.name === "web.config") continue;
    const previous = expected.get(entry.name);
    const targetPath = path.join(target, entry.name);
    if (!previous) {
      await rm(targetPath, { recursive: true, force: true });
    } else if (entry.isDirectory() && previous.isDirectory()) {
      await removeObsolete(path.join(source, entry.name), targetPath);
    }
  }
}
await removeObsolete(exported, output);
await cp(path.join(root, "iis/web.config"), path.join(output, "web.config"));
console.log("Site statique prêt dans out/. IIS peut servir directement ce dossier.");
