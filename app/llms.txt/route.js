import { SITE, absoluteUrl } from "@/lib/site";
import { DESTINATIONS, forName } from "@/lib/destinations";
import { getOffers, validPairs, getDatasetMeta } from "@/lib/data";
import { providerName, pairSlug } from "@/lib/providers";
import { money, fullDate } from "@/lib/format";

// Vereist voor `output: "export"`: wordt op build-tijd een statisch /llms.txt bestand.
export const dynamic = "force-static";

// llms.txt: beknopte, machineleesbare gids voor AI-zoekmachines. Alleen pagina's met
// geverifieerde prijzen (hasPage) komen erin; de rest staat op noindex.
export function GET() {
  const meta = getDatasetMeta();
  const generated = fullDate(meta.generatedAt);

  const lines = [];
  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(`> ${SITE.tagline}. Every eSIM plan is ranked by price per GB, and every page shows the date its prices were checked. Prices are never converted between currencies and a destination is only published when at least two providers have verified prices.`);
  lines.push("");
  if (generated) lines.push(`Data last generated: ${generated}.`);
  lines.push("");

  lines.push("## Destinations");
  for (const d of DESTINATIONS) {
    const o = getOffers(d.slug);
    if (!o.hasPage) continue;
    const l = o.verdicts.lowestPerGb;
    const checked = fullDate(o.fetchedAt);
    const note = [
      l ? `lowest ${money(l.perGb, o.currency)}/GB via ${providerName(l.provider)}` : null,
      `${o.providers.length} providers`,
      checked ? `checked ${checked}` : null,
    ].filter(Boolean).join(", ");
    lines.push(`- [Best eSIM for ${forName(d)}](${absoluteUrl(`/esim/${d.slug}`)}): ${note}.`);
  }
  lines.push("");

  const pairs = validPairs();
  if (pairs.length) {
    lines.push("## Provider comparisons");
    for (const p of pairs) {
      lines.push(`- [${providerName(p[0])} vs ${providerName(p[1])}](${absoluteUrl(`/compare/${pairSlug(p)}`)})`);
    }
    lines.push("");
  }

  lines.push("## Data");
  lines.push(`- [eSIM price spread by destination](${absoluteUrl("/esim-price-spread")}): cheapest vs most expensive provider per GB, same destination (free to cite).`);
  lines.push("");

  lines.push("## About");
  lines.push(`- [How we rank (methodology)](${absoluteUrl("/methodology")})`);
  lines.push(`- [Affiliate disclosure](${absoluteUrl("/affiliate-disclosure")})`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
