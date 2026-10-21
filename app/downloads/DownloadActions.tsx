"use client";
import { useEffect, useRef, useState } from "react";
import {
  readDownloadCount,
  recordDownload,
  type DownloadApplication,
} from "./statistics";

export default function DownloadActions({
  application,
  source,
  path,
  label,
}: {
  application: DownloadApplication;
  source: string;
  path: string;
  label: string;
}) {
  const [count, setCount] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const receipt = useRef<{ id: string; created: number } | null>(null);
  useEffect(() => {
    let active = true;
    let current: AbortController | null = null;
    const refresh = () => {
      current?.abort();
      const controller = new AbortController();
      current = controller;
      const timer = setTimeout(() => controller.abort(), 3000);
      void readDownloadCount(application, controller.signal)
        .then((value) => {
          if (active && current === controller) {
            setCount((previous) => Math.max(previous ?? 0, value));
            setUnavailable(false);
          }
        })
        .catch(() => {
          if (active && current === controller) setUnavailable(true);
        })
        .finally(() => clearTimeout(timer));
    };
    refresh();
    const interval = setInterval(refresh, 60000);
    addEventListener("focus", refresh);
    return () => {
      active = false;
      current?.abort();
      clearInterval(interval);
      removeEventListener("focus", refresh);
    };
  }, [application]);

  const track = () => {
    // Both download sources share a receipt, so a double click or immediate retry counts once.
    if (!receipt.current || Date.now() - receipt.current.created > 30000)
      receipt.current = { id: crypto.randomUUID(), created: Date.now() };
    // Keep the actual link functional even if counting is slow, blocked or unavailable.
    void recordDownload(application, receipt.current.id)
      .then((value) => {
        setCount((previous) => Math.max(previous ?? 0, value));
        setUnavailable(false);
      })
      .catch(() => setUnavailable(true));
  };

  return (
    <>
      <div
        className="download-statistic"
        role="status"
        aria-live="polite"
        title={
          unavailable
            ? "Compteur temporairement indisponible"
            : "Téléchargements lancés depuis le site, toutes versions confondues. Les installations et anciens téléchargements ne sont pas mesurés."
        }
      >
        <span aria-hidden="true">↓</span>
        <div>
          <strong>
            {count === null
              ? "—"
              : new Intl.NumberFormat("fr-FR").format(count)}
          </strong>
          <span>{count === 1 ? "téléchargement" : "téléchargements"}</span>
        </div>
        {unavailable && <small>Compteur temporairement indisponible</small>}
      </div>
      <a className="btn" href={source} onClick={track}>
        {label}
      </a>
      <a href={path} download={path.split("/").pop()} onClick={track}>
        Autre lien : serveur Bomoi
      </a>
    </>
  );
}
