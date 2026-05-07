import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-cdio.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/scan`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/chat`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
