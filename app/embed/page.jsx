import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/schema";

export const metadata = {
  title: "Free embeddable eSIM tools (widgets for your travel guide)",
  description:
    "Two free, no-signup eSIM widgets you can embed in any site: a live cheapest-eSIM-by-country table and a 'how much data do I need?' calculator. Prices from GBScout, dated and auto-updating.",
  alternates: { canonical: "/embed" },
};

const TOOLS = [
  {
    id: "esim",
    file: "esim.html",
    title: "Cheapest eSIM by country",
    tagline: "Pick a destination, show the cheapest data plan (per GB) and the cheapest unlimited (per day), with the date the price was checked.",
    height: 520,
  },
  {
    id: "data-calculator",
    file: "data-calculator.html",
    title: "How much eSIM data do I need?",
    tagline: "Trip length plus a usage profile gives a GB estimate, then recommends the cheapest plan that covers it for the chosen country.",
    height: 620,
  },
];

function snippetFor(tool) {
  const url = `${SITE.url}/embed/${tool.file}`;
  return (
    `<iframe src="${url}" title="${tool.title} — GBScout" width="100%" height="${tool.height}" ` +
    `style="border:0;max-width:520px;width:100%" loading="lazy"></iframe>\n` +
    `<script>window.addEventListener("message",function(e){` +
    `if(e.data&&e.data.gbscoutWidget==="${tool.id}"){` +
    `var f=document.querySelector('iframe[src*="/embed/${tool.file}"]');` +
    `if(f&&e.data.height)f.style.height=e.data.height+"px";}});<\/script>`
  );
}

export default function EmbedPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Embeddable tools", path: "/embed" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs trail={trail} />

      <h1 className="mt-6 max-w-3xl text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">
        Free eSIM widgets for your travel guide
      </h1>
      <p className="mt-4 max-w-2xl text-pretty text-stone-700">
        Drop a live eSIM price tool into any blog post or page. Both widgets are free, need no sign-up, and pull from the
        same dated prices as GBScout, so they stay current without you touching them. Copy the snippet, paste it where you
        want the tool, done.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-stone-500">
        Prices are compared in USD and ranked by cost per GB (cost per day for unlimited plans). Non-USD plans are left
        out rather than converted. The tiny script in each snippet just auto-resizes the iframe to its content.
      </p>

      <div className="mt-10 grid gap-12">
        {TOOLS.map((tool) => {
          const snippet = snippetFor(tool);
          return (
            <section key={tool.id} aria-labelledby={`t-${tool.id}`} className="scroll-mt-20">
              <h2 id={`t-${tool.id}`} className="text-2xl font-semibold text-balance text-stone-900">
                {tool.title}
              </h2>
              <p className="mt-2 max-w-2xl text-pretty text-stone-700">{tool.tagline}</p>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Live preview</p>
                  <div className="rounded-2xl border border-stone-200 bg-white p-3">
                    <iframe
                      id={`preview-${tool.id}`}
                      src={`/embed/${tool.file}`}
                      title={`${tool.title} — live preview`}
                      className="w-full"
                      style={{ border: 0, height: tool.height, maxWidth: 520 }}
                      loading="lazy"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Embed code (click to select, then copy)
                  </p>
                  <textarea
                    readOnly
                    className="embed-snippet h-48 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-3 font-mono text-xs leading-relaxed text-stone-800"
                    value={snippet}
                    aria-label={`Embed code for ${tool.title}`}
                  />
                  <p className="mt-2 text-sm text-stone-500">
                    Prefer a clean link? Point any iframe at{" "}
                    <Link href={`/embed/${tool.file}`} className="underline underline-offset-2 hover:text-stone-900">
                      {SITE.url.replace(/^https?:\/\//, "")}/embed/{tool.file}
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <JsonLd
                data={{
                  "@context": "https://schema.org",
                  "@type": "WebApplication",
                  name: `${tool.title} — GBScout widget`,
                  description: tool.tagline,
                  url: absoluteUrl(`/embed/${tool.file}`),
                  applicationCategory: "TravelApplication",
                  operatingSystem: "Any (web browser)",
                  isAccessibleForFree: true,
                  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                  publisher: { "@id": `${SITE.url}/#org` },
                }}
              />
            </section>
          );
        })}
      </div>

      <section aria-labelledby="terms" className="mt-14 max-w-2xl">
        <h2 id="terms" className="text-lg font-semibold text-stone-900">Can I use these?</h2>
        <p className="mt-2 text-pretty text-stone-700">
          Yes, free to embed on any site. The widgets keep a small GBScout attribution link. Prices change often, so both
          tools show the date they were last checked and remind readers to confirm on the provider's page before buying.
          See the{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-stone-900">methodology</Link> for how
          the ranking works.
        </p>
      </section>

      <JsonLd data={breadcrumbJsonLd(trail)} />

      {/* Auto-resize the live previews, and select-on-click for the embed snippets. Inline so it
          ships in the static export without a client component. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            'window.addEventListener("message",function(e){var d=e&&e.data;if(!d||!d.gbscoutWidget)return;' +
            'var f=document.getElementById("preview-"+d.gbscoutWidget);if(f&&d.height)f.style.height=d.height+"px";});' +
            'document.addEventListener("DOMContentLoaded",function(){' +
            'document.querySelectorAll(".embed-snippet").forEach(function(t){' +
            't.addEventListener("focus",function(){t.select();});' +
            't.addEventListener("click",function(){t.select();});});});',
        }}
      />
    </div>
  );
}
