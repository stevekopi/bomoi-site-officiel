import { mkdir, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const runtimeRoot = process.env.SITES_RUNTIME_ROOT
  ? path.resolve(process.env.SITES_RUNTIME_ROOT)
  : path.join(projectRoot, ".sites-runtime");

const runtimeDirectories = {
  home: path.join(runtimeRoot, "home"),
  npmCache: path.join(runtimeRoot, "npm-cache"),
  xdgConfig: path.join(runtimeRoot, "xdg-config"),
  temporary: path.join(runtimeRoot, "tmp"),
  wranglerLogs: path.join(runtimeRoot, "wrangler", "logs"),
};

await Promise.all(
  Object.values(runtimeDirectories).map((directory) =>
    mkdir(directory, { recursive: true }),
  ),
);

const environment = {
  ...process.env,
  SITES_ENV_READY: "1",
  SITES_PROJECT_ROOT: projectRoot,
  HOME: runtimeDirectories.home,
  XDG_CONFIG_HOME: runtimeDirectories.xdgConfig,
  TMPDIR: runtimeDirectories.temporary,
  TEMP: runtimeDirectories.temporary,
  TMP: runtimeDirectories.temporary,
  WRANGLER_WRITE_LOGS: "false",
  WRANGLER_LOG_PATH: runtimeDirectories.wranglerLogs,
  MINIFLARE_REGISTRY_PATH: path.join(runtimeRoot, "wrangler", "registry"),
  npm_config_cache: runtimeDirectories.npmCache,
  npm_config_audit: "false",
  npm_config_fund: "false",
  npm_config_update_notifier: "false",
};

for (const key of [
  "NPM_CONFIG_CACHE",
  "npm_config_proxy",
  "npm_config_http_proxy",
  "npm_config_https_proxy",
  "NPM_CONFIG_PROXY",
  "NPM_CONFIG_HTTP_PROXY",
  "NPM_CONFIG_HTTPS_PROXY",
]) {
  delete environment[key];
}

const parseDuration = (value, fallbackMilliseconds) => {
  if (!value) return fallbackMilliseconds;
  const match = /^(\d+(?:\.\d+)?)(ms|s|m)?$/i.exec(value.trim());
  if (!match) throw new Error(`Invalid build timeout: ${value}`);
  const multipliers = { ms: 1, s: 1_000, m: 60_000 };
  return Number(match[1]) * multipliers[(match[2] || "ms").toLowerCase()];
};

const vinextCli = path.join(projectRoot, "node_modules", "vinext", "dist", "cli.js");
const buildTimeout = parseDuration(process.env.SITES_BUILD_TIMEOUT, 180_000);

console.log("Running bounded vinext build...");

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [vinextCli, "build"], {
    cwd: projectRoot,
    env: environment,
    stdio: "inherit",
  });

  const timer = setTimeout(() => {
    child.kill("SIGTERM");
    reject(new Error(`Build exceeded ${buildTimeout} ms.`));
  }, buildTimeout);

  child.once("error", (error) => {
    clearTimeout(timer);
    reject(error);
  });

  child.once("exit", (code, signal) => {
    clearTimeout(timer);
    if (code === 0) resolve();
    else reject(new Error(`Vinext build failed (${signal || `exit code ${code}`}).`));
  });
});

const workerPath = path.join(projectRoot, "dist", "server", "index.js");
const hostingPath = path.join(projectRoot, "dist", ".openai", "hosting.json");

JSON.parse(await readFile(hostingPath, "utf8"));

const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("sites-validation", `${process.pid}-${Date.now()}`);
const worker = await import(workerUrl.href);

if (!worker.default || typeof worker.default.fetch !== "function") {
  throw new Error(
    "dist/server/index.js must have an ESM default export with fetch(request, env, ctx)",
  );
}

console.log(
  "Validated Sites artifact: ESM Worker default.fetch and hosting manifest are present.",
);
