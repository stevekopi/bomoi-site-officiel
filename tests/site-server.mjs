import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function launchSite() {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "bomoi-node-site-test-"),
  );
  const probe = createServer();
  await new Promise((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", resolve);
  });
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const output = fileURLToPath(new URL("../out/", import.meta.url));
  const child = spawn(process.execPath, [path.join(output, "server.js")], {
    cwd: output,
    env: {
      ...process.env,
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
      NODE_ENV: "production",
      BOMOI_DOWNLOAD_DATA_DIR: path.join(directory, "data"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs = (logs + chunk).slice(-8000);
  });
  child.stderr.on("data", (chunk) => {
    logs = (logs + chunk).slice(-8000);
  });
  const base = `http://127.0.0.1:${port}`;
  const stop = async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill("SIGTERM");
      await exited;
    }
    await rm(directory, { recursive: true, force: true });
  };
  try {
    for (let i = 0; i < 150; i++) {
      if (child.exitCode !== null || child.signalCode !== null)
        throw new Error(logs);
      try {
        if ((await fetch(base + "/")).ok)
          return {
            base,
            stop,
            directory,
            fetch: (request) =>
              fetch(new URL(new URL(request.url).pathname, base), {
                headers: request.headers,
              }),
          };
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("Node site did not become ready: " + logs);
  } catch (error) {
    await stop();
    throw error;
  }
}
