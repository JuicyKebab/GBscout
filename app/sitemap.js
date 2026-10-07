import { absoluteUrl } from "@/lib/site";
import { DESTINATIONS } from "@/lib/destinations";
import { getDatasetMeta, getOffers, providersWithAlternatives, providersWithData, validPairs } from "@/lib/data";
import { pairSlug } from "@/lib/providers";

// Vereist voor `output: "export"` (statische build).
export const dynamic = "force-static";

export default function sitemap() {
  const meta = getDatasetMeta();
  const lastModified = meta.generatedAt ? new Date(meta.generatedAt) : undefined;
  // Alleen pagina's met echte data; de rest staat op noindex en hoort niet in de sitemap.
  const destinations = DESTINATIONS.filter((d) => getOffers(d.slug).hasPage).map((d) => ({
    url: absoluteUrl(`/esim/${d.slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const pairs = validPairs().map((p) => ({
    url: absoluteUrl(`/compare/${pairSlug(p)}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  const alternatives = providersWithAlternatives().map((p) => ({
    url: absoluteUrl(`/alternatives/${p}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  const providers = providersWithData().map((p) => ({
    url: absoluteUrl(`/providers/${p}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/esim"), lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/esim-price-spread"), lastModified, changeFrequency: "weekly", priority: 0.6 },
    ...destinations,
    ...providers,
    ...pairs,
    ...alternatives,
    { url: absoluteUrl("/methodology"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/affiliate-disclosure"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
