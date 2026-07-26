import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev-only: author previews the dev server over Tailscale
  allowedDevOrigins: ["wsl-debian.tail338aee.ts.net"],
};

export default nextConfig;
