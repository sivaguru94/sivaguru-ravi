import type { MetadataRoute } from "next";

export const dynamic = "force-static"; // required for output:'export'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://shinigami-rog.cc/sitemap.xml",
  };
}
