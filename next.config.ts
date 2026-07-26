import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev-only: author previews the dev server over Tailscale
  allowedDevOrigins: ["wsl-debian.tail338aee.ts.net"],

  /*
   * Security headers (plan §9). A full script-src CSP is deliberately
   * deferred: App Router inline hydration scripts + our body-first
   * no-flash script would need hash/nonce plumbing — do NOT add a naive
   * CSP later without accounting for both.
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
