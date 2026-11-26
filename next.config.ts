import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  return {
    output: "export",
    // Export separately so Next.js never removes IIS's active out directory.
    distDir: phase === PHASE_PRODUCTION_BUILD ? ".iis-export" : ".next",
    trailingSlash: true,
    images: { unoptimized: true },
    // The IIS build type-checks the application separately from the Sites starter.
    typescript: { ignoreBuildErrors: true },
  };
}
