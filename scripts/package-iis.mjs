import { access, cp, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const staged = path.join(root, ".iis-package-" + process.pid);
const previous = path.join(root, ".iis-previous-" + process.pid);
let preserved = false;
try {
  await access(path.join(root, ".next/standalone/server.js"));
  await mkdir(staged, { recursive: true });
  await cp(path.join(root, ".next/standalone"), staged, { recursive: true });
  await cp(path.join(root, "public"), path.join(staged, "public"), {
    recursive: true,
  });
  await cp(path.join(root, ".next/static"), path.join(staged, ".next/static"), {
    recursive: true,
  });
  await cp(path.join(root, "iis/web.config"), path.join(staged, "web.config"));
  // out is a generated deployment folder. Persistent counters live outside it.
  try {
    await rename(path.join(root, "out"), previous);
    preserved = true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  try {
    await rename(staged, path.join(root, "out"));
  } catch (error) {
    if (preserved) await rename(previous, path.join(root, "out"));
    throw error;
  }
  if (preserved) await rm(previous, { recursive: true, force: true });
  console.log(
    "IIS / Node.js package ready in out/. Start with npm run start:iis.",
  );
} catch (error) {
  await rm(staged, { recursive: true, force: true });
  throw error;
}
