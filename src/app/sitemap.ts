import type { MetadataRoute } from "next";

/* single-page site: only `/` is canonical (deep links are noindex) */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://shinigami-rog.cc",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
