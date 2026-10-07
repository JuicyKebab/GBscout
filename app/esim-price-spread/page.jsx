import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";
import { getPriceSpread, getDatasetMeta } from "@/lib/data";
import { providerName } from "@/lib/providers";

export const metadata = {
  title: "The eSIM price gap: same destination, up to 9x the price per GB",
  description:
    "For the same country, the cheapest eSIM provider can cost a fraction of the priciest per GB. Here is the gap across destinations, from real plan prices. Free to cite.",
  alternates: { canonical: "/esim-price-spread" },
};

const money = (v, cur) => `${cur === "USD" ? "$" : ""}${v.toFixed(2)}`;

export default function PriceSpread() {
  const rows = getPriceSpread(12);
  const meta = getDatasetMeta();
  const cur = rows[0]?.currency || SITE.currency;
  const maxHi = Math.max(...rows.map((r) => r.hi.perGb));
  const top = rows[0];

  // SVG-geometrie (viewBox-eenheden). Linksnaam, midden plot, rechts ratio.
  const W = 690, rowH = 34, padTop = 8, padBot = 8;
  const H = padTop + padBot + rows.length * rowH;
  const xName = 0, xPlot0 = 158, xPlot1 = 520, xRatio = 600;
  const scale = (v) => xPlot0 + (v / maxHi) * (xPlot1 - xPlot0);
  const cy = (i) => padTop + i * rowH + rowH / 2;

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "eSIM price-per-GB spread by destination",
    description:
      "Cheapest vs most expensive eSIM provider per destination, by lowest price per GB, computed from real plan prices on GBScout.",
    creator: { "@type": "Organization", name: SITE.name, url: SITE.url },
    url: absoluteUrl("/esim-price-spread"),
    temporalCoverage: meta.generatedAt ? meta.generatedAt.slice(0, 10) : undefined,
    keywords: ["esim price comparison", "price per gb", "cheapest esim", "esim providers"],
    isAccessibleForFree: true,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Price spread", path: "/esim-price-spread" }]} />

      <h1 className="mt-6 max-w-3xl text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">
        The same country, up to {top ? Math.round(top.ratio) : 9}x the price per GB
      </h1>
      <p className="mt-4 max-w-2xl text-pretty text-stone-700">
        Pick a destination and the cheapest eSIM provider often costs a fraction of the priciest, for the same gigabyte.
        Below is the gap for the {rows.length} destinations with the widest spread, from real plan prices
        {meta.generatedAt ? ` checked ${meta.generatedAt.slice(0, 10)}` : ""}. Ranked by lowest price per GB per provider.
      </p>

      {/* Legend (identiteit nooit alleen via kleur) */}
      <div className="spread mt-6 flex items-center gap-5 text-sm text-stone-700">
        <span className="inline-flex items-center gap-2"><span className="dot dot-lo" /> Cheapest provider</span>
        <span className="inline-flex items-center gap-2"><span className="dot dot-hi" /> Most expensive</span>
      </div>

      <figure className="spread mt-3">
        <div style={{ overflowX: "auto", position: "relative" }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 560, display: "block" }} role="img"
            aria-label={`Price per GB gap across ${rows.length} destinations, cheapest to most expensive provider.`}>
            {rows.map((r, i) => {
              const y = cy(i), xLo = scale(r.lo.perGb), xHi = scale(r.hi.perGb);
              return (
                <g key={r.slug}>
                  <text x={xName} y={y} className="svg-name" dominantBaseline="middle">{r.name}</text>
                  <line x1={xLo} y1={y} x2={xHi} y2={y} className="svg-connect" />
                  <circle cx={xHi} cy={y} r={5} className="svg-hi">
                    <title>{`${r.name}: ${providerName(r.hi.provider)} ${money(r.hi.perGb, r.currency)}/GB (most expensive)`}</title>
                  </circle>
                  <circle cx={xLo} cy={y} r={5} className="svg-lo">
                    <title>{`${r.name}: ${providerName(r.lo.provider)} ${money(r.lo.perGb, r.currency)}/GB (cheapest)`}</title>
                  </circle>
                  <text x={xLo - 8} y={y} className="svg-val" textAnchor="end" dominantBaseline="middle">{money(r.lo.perGb, r.currency)}</text>
                  <text x={xHi + 8} y={y} className="svg-val" dominantBaseline="middle">{money(r.hi.perGb, r.currency)}</text>
                  <text x={xRatio} y={y} className="svg-ratio" dominantBaseline="middle">{r.ratio.toFixed(1)}x</text>
                </g>
              );
            })}
          </svg>
        </div>
        <figcaption className="mt-3 text-xs text-stone-500">
          Price per GB = each provider&apos;s lowest fixed-plan price divided by its data allowance, in {cur}. Prices change; see each
          destination page for the live figure and date.
        </figcaption>
      </figure>

      {/* Tabelweergave (toegankelijkheid + citeerbaar) */}
      <h2 className="mt-10 text-xl font-semibold text-stone-900">The numbers</h2>
      <div className="mt-3" style={{ overflowX: "auto" }}>
        <table className="w-full border-collapse text-sm" style={{ minWidth: 520 }}>
          <thead>
            <tr className="border-b-2 border-stone-200 text-left">
              <th className="p-2">Destination</th>
              <th className="p-2">Cheapest</th>
              <th className="p-2">Most expensive</th>
              <th className="p-2">Gap</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-b border-stone-100">
                <td className="p-2"><Link href={`/esim/${r.slug}`} className="underline underline-offset-2">{r.name}</Link></td>
                <td className="p-2">{providerName(r.lo.provider)} {money(r.lo.perGb, r.currency)}</td>
                <td className="p-2">{providerName(r.hi.provider)} {money(r.hi.perGb, r.currency)}</td>
                <td className="p-2 tabular-nums">{r.ratio.toFixed(1)}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-stone-500">
        Compiled by {SITE.name} from real plan prices. Reuse with a link to this page. Method on the{" "}
        <Link href="/methodology" className="underline underline-offset-2">methodology</Link> page.
      </p>

      <style>{`
        .spread .dot{width:12px;height:12px;border-radius:9999px;display:inline-block}
        .spread .dot-lo{background:#2a78d6}
        .spread .dot-hi{background:#e34948}
        .spread .svg-name{fill:#52514e;font-size:12px}
        .spread .svg-val{fill:#0b0b0b;font-size:11px;font-variant-numeric:tabular-nums}
        .spread .svg-ratio{fill:#52514e;font-size:12px;font-weight:600}
        .spread .svg-connect{stroke:#d8d7d2;stroke-width:2}
        .spread .svg-lo{fill:#2a78d6}
        .spread .svg-hi{fill:#e34948}
      `}</style>
    </div>
  );
}
