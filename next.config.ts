import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // The IIS build is type-checked separately because the repository also
  // contains Cloudflare-only worker files that standard Next.js cannot load.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
