import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";

export const applications = ["bomoi-pos", "bomoi-exchange-pos", "bomoi-stock-client"];
export class CounterRateLimitError extends Error {}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const validReceipt = (value) =>
  typeof value === "string" &&
  uuid.test(value) &&
  value !== "00000000-0000-0000-0000-000000000000";

export function dataDirectory() {
  const fallback =
    process.platform === "win32"
      ? path.join(
          process.env.ProgramData || "C:\\ProgramData",
          "BomoiSite",
          "DownloadStatistics",
        )
      : path.join(
          os.homedir(),
          ".local",
          "share",
          "bomoi-site",
          "download-statistics",
        );
  const directory = path.resolve(
    process.env.BOMOI_DOWNLOAD_DATA_DIR || fallback,
  );
  // Runtime data must never be exposed or replaced by a build of the website.
  const relative = path.relative(process.cwd(), directory);
  if (
    !relative.startsWith(".." + path.sep) &&
    relative !== ".." &&
    !path.isAbsolute(relative)
  )
    throw new Error(
      "BOMOI_DOWNLOAD_DATA_DIR must be outside the website directory.",
    );
  return directory;
}

export function createDownloadCounters(
  directory,
  { now = Date.now, limit = 300 } = {},
) {
  mkdirSync(directory, { recursive: true });
  const database = new DatabaseSync(path.join(directory, "downloads.sqlite"));
  try {
    database.exec("PRAGMA busy_timeout=3000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;");
    database.exec("BEGIN IMMEDIATE");
    database.exec(`
      CREATE TABLE IF NOT EXISTS download_totals (
        application TEXT PRIMARY KEY CHECK(application IN ('bomoi-pos','bomoi-exchange-pos','bomoi-stock-client')),
        count INTEGER NOT NULL CHECK(count BETWEEN 0 AND 9007199254740991)
      );
      CREATE TABLE IF NOT EXISTS download_receipts (
        application TEXT NOT NULL REFERENCES download_totals(application),
        request_id TEXT NOT NULL, created_at INTEGER NOT NULL,
        PRIMARY KEY(application, request_id)
      );`);
    const schema = database.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='download_totals'").get().sql;
    if (!schema.includes("'bomoi-exchange-pos'")) {
      // Rebuild both constrained tables atomically, retaining lifetime totals and receipts.
      database.exec(`
        CREATE TABLE download_totals_next (
          application TEXT PRIMARY KEY CHECK(application IN ('bomoi-pos','bomoi-exchange-pos','bomoi-stock-client')),
          count INTEGER NOT NULL CHECK(count BETWEEN 0 AND 9007199254740991)
        );
        CREATE TABLE download_receipts_next (
          application TEXT NOT NULL REFERENCES download_totals_next(application),
          request_id TEXT NOT NULL, created_at INTEGER NOT NULL,
          PRIMARY KEY(application, request_id)
        );
        INSERT INTO download_totals_next SELECT application, count FROM download_totals;
        INSERT INTO download_receipts_next SELECT application, request_id, created_at FROM download_receipts;
        DROP TABLE download_receipts;
        DROP TABLE download_totals;
        ALTER TABLE download_totals_next RENAME TO download_totals;
        ALTER TABLE download_receipts_next RENAME TO download_receipts;
      `);
    }
    database.exec(`
      CREATE INDEX IF NOT EXISTS download_receipt_time ON download_receipts(created_at);
      INSERT INTO download_totals VALUES ('bomoi-pos',0), ('bomoi-exchange-pos',0), ('bomoi-stock-client',0)
      ON CONFLICT(application) DO NOTHING;
      COMMIT;
    `);
  } catch (error) {
    if (database.isTransaction) database.exec("ROLLBACK");
    database.close();
    throw error;
  }

  function read() {
    const counts = Object.fromEntries(
      database
        .prepare("SELECT application, count FROM download_totals")
        .all()
        .map((row) => [row.application, row.count]),
    );
    if (
      applications.some(
        (id) => !Number.isSafeInteger(counts[id]) || counts[id] < 0,
      )
    )
      throw new Error("Invalid download totals");
    return counts;
  }
  return {
    read,
    record(application, requestId) {
      if (!applications.includes(application) || !validReceipt(requestId))
        throw new TypeError("Invalid download request");
      const receipt = requestId.toLowerCase();
      const instant = now();
      database.exec("BEGIN IMMEDIATE");
      try {
        database
          .prepare("DELETE FROM download_receipts WHERE created_at <= ?")
          .run(instant - 600000);
        const previous = database
          .prepare(
            "SELECT 1 FROM download_receipts WHERE application = ? AND request_id = ?",
          )
          .get(application, receipt);
        if (!previous) {
          const recent = database
            .prepare(
              "SELECT count(*) AS count FROM download_receipts WHERE created_at > ?",
            )
            .get(instant - 60000);
          if (recent.count >= limit)
            throw new CounterRateLimitError("Too many download requests");
          database
            .prepare("INSERT INTO download_receipts VALUES (?,?,?)")
            .run(application, receipt, instant);
          database
            .prepare(
              "UPDATE download_totals SET count = count + 1 WHERE application = ?",
            )
            .run(application);
        }
        const count = read()[application];
        database.exec("COMMIT");
        return count;
      } catch (error) {
        database.exec("ROLLBACK");
        throw error;
      }
    },
    close() {
      database.close();
    },
  };
}

let counters;
export function getDownloadCounters() {
  return (counters ??= createDownloadCounters(dataDirectory()));
}
