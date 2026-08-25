import { copyFile, mkdir } from "node:fs/promises";

await mkdir("out", { recursive: true });
await copyFile("iis/web.config", "out/web.config");
console.log("IIS package ready in out/");
