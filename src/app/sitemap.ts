import type { MetadataRoute } from "next";
import { DESTINATIONS } from "@/mocks/destinations";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greengotransfers.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/reservar`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...DESTINATIONS.map((destination) => ({
      url: `${siteUrl}/destinos/${destination.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
