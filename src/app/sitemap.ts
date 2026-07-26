import type { MetadataRoute } from "next";

export const dynamic = "force-static"; // required for output:'export'

/* single-page site: only `/` is canonical (deep links are noindex) */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://shinigami-rog.cc/sivaguru-ravi",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
