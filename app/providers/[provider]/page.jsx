import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import { ProviderFacts, FairUseNotes } from "@/components/FactsTable";
import { getProviderOverview, providersWithData, getAlternatives } from "@/lib/data";
import { fullDate, money, plural } from "@/lib/format";
import { outbound, providerName, pairSlug, PAIRS } from "@/lib/providers";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return providersWithData().map((provider) => ({ provider }));
}

export async function generateMetadata({ params }) {
  const { provider } = await params;
  if (!providersWithData().includes(provider)) return {};
  const o = getProviderOverview(provider);
  const name = providerName(provider);
  const canonical = `/providers/${provider}`;
  const lead = o.lowestPerGb
    ? ` Lowest price per GB: ${money(o.lowestPerGb.bestPerGb, o.currency)} (${o.lowestPerGb.name}).`
    : o.cheapestUnlimited7
      ? ` Cheapest 7-day unlimited plan: ${money(o.cheapestUnlimited7.price, o.currency)} (${o.cheapestUnlimited7.destination}).`
      : "";
  return {
    title: `${name} eSIM review (${new Date().getFullYear()}): prices across ${o.destinations} destinations`,
    description: `What ${name} costs, where it covers, and how it compares.${lead} Prices checked and ranked by price per GB.`,
    alternates: { canonical },
  };
}

function answerText(name, o) {
  const date = fullDate(o.fetchedAt);
  const parts = [
    `${date ? `As of ${date}, we` : "We"} track ${plural(o.destinations, "destination")} where ${name} has verified prices among the destinations we compare.`,
  ];
  if (o.hasFixed && o.lowestPerGb) {
    parts.push(`Its best value on fixed-data plans is ${money(o.lowestPerGb.bestPerGb, o.currency)} per GB in ${o.lowestPerGb.name}.`);
  }
  if (o.cheapestUnlimited7) {
    parts.push(`The cheapest 7-day unlimited plan we found is ${money(o.cheapestUnlimited7.price, o.currency)} in ${o.cheapestUnlimited7.destination}.`);
  }
  if (!o.hasFixed && !o.cheapestUnlimited7) {
    parts.push(`See the destination pages for current prices.`);
  }
  parts.push(`We rank on price only; this is not a measure of network quality or speed.`);
  return parts.join(" ");
}

export default async function ProviderPage({ params }) {
  const { provider } = await params;
  if (!providersWithData().includes(provider)) notFound();
  const o = getProviderOverview(provider);
  const name = providerName(provider);
  const alts = getAlternatives(provider);
  const trail = [
    { name: "Home", path: "/" },
    { name: `${name} eSIM`, path: `/providers/${provider}` },
  ];
  const date = fullDate(o.fetchedAt);
  const cta = outbound(provider, { subid: `provider-${provider}` });

  // Top bestemmingen voor deze provider (op prijs per GB als er vaste plannen zijn, anders op
  // goedkoopste plan). Elke rij linkt de bestemmingspagina (interne links naar de long-tail).
  const tableRows = o.rows.filter((r) => (o.hasFixed ? r.bestPerGb != null : true)).slice(0, 12);

  const faqs = [
    {
      q: `Is ${name} worth it?`,
      a: `${name} has verified prices in ${plural(o.destinations, "destination")} we compare.${o.lowestPerGb ? ` Its best price per GB is ${money(o.lowestPerGb.bestPerGb, o.currency)} in ${o.lowestPerGb.name}.` : ""} Whether it is the cheapest depends on your destination; the table above and the ${name} alternatives page show how it ranks. We compare on price only, not network quality, speed or support.`,
    },
    {
      q: `How much does a ${name} eSIM cost?`,
      a: o.rows.length
        ? `Across the destinations we track, ${name} plans start at ${money(Math.min(...o.rows.map((r) => r.cheapestPrice)), o.currency)}.${o.lowestPerGb ? ` On a per-GB basis the best value is ${money(o.lowestPerGb.bestPerGb, o.currency)} per GB.` : ""} Prices change often, so check the provider's page before you buy.`
        : `See the destination pages for current ${name} prices.`,
    },
    {
      q: `Does ${name} offer unlimited data?`,
      a: o.hasUnlimited
        ? `Yes. ${name} sells unlimited plans, which typically slow down after a daily amount of high-speed data. See the limits each provider states below.`
        : `On the destinations we track, we did not find unlimited plans from ${name}; it sells fixed-data plans. Check the provider's page for the latest.`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 max-w-3xl text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">
        {name} eSIM review: prices across {plural(o.destinations, "destination")}
      </h1>
      {date ? <p className="mt-2 text-sm text-stone-500">Prices checked {date}.</p> : null}
      <p className="mt-4 max-w-3xl text-base text-pretty text-stone-800 sm:text-lg">{answerText(name, o)}</p>

      {cta.affiliate ? (
        <p className="mt-6">
          <a href={cta.href} rel={cta.rel} target="_blank" className="inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            Visit {name}
          </a>
          <span className="ml-3 text-sm text-stone-500">Affiliate link. It does not change our price-only ranking.</span>
        </p>
      ) : null}

      {tableRows.length ? (
        <section aria-labelledby="prices" className="mt-12">
          <h2 id="prices" className="text-2xl font-semibold text-balance text-stone-900">
            {name} prices by destination{o.hasFixed ? ", best price per GB" : ""}
          </h2>
          <div className="relative mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white px-5 py-2">
            <table className="w-full min-w-[28rem] text-sm">
              <caption className="sr-only">{name} prices per destination</caption>
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs uppercase text-stone-500">
                  <th scope="col" className="py-2 pr-4 font-medium">Destination</th>
                  {o.hasFixed ? <th scope="col" className="py-2 pr-4 font-medium">Best price / GB</th> : null}
                  <th scope="col" className="py-2 pr-4 font-medium">From</th>
                  <th scope="col" className="py-2 font-medium"><span className="sr-only">Link</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {tableRows.map((r) => (
                  <tr key={r.slug}>
                    <th scope="row" className="py-3 pr-4 text-left font-medium text-stone-900">{r.name}</th>
                    {o.hasFixed ? <td className="py-3 pr-4 tabular-nums text-stone-700">{r.bestPerGb != null ? `${money(r.bestPerGb, o.currency)}/GB` : "—"}</td> : null}
                    <td className="py-3 pr-4 tabular-nums text-stone-700">{money(r.cheapestPrice, o.currency)}</td>
                    <td className="py-3 text-right">
                      <Link href={`/esim/${r.slug}`} className="text-sm font-medium text-teal-800 underline-offset-2 hover:underline">
                        Compare {r.name}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-stone-500">
            See <Link href="/esim" className="underline underline-offset-2 hover:text-stone-900">all destinations</Link>.
          </p>
        </section>
      ) : null}

      <ProviderFacts provider={provider} />

      {o.hasUnlimited ? <FairUseNotes providers={[provider]} /> : null}

      {alts.length ? (
        <section aria-labelledby="compare" className="mt-12">
          <h2 id="compare" className="text-lg font-semibold text-stone-900">How {name} compares</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            <li>
              <Link href={`/alternatives/${provider}`} className="inline-block rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-900 hover:border-teal-700">
                {name} alternatives
              </Link>
            </li>
            {alts
              .map((a) => PAIRS.find(([x, y]) => (x === provider && y === a.provider) || (x === a.provider && y === provider)))
              .filter(Boolean)
              .slice(0, 6)
              .map((pair) => {
                const other = pair[0] === provider ? pair[1] : pair[0];
                return (
                  <li key={other}>
                    <Link href={`/compare/${pairSlug(pair)}`} className="inline-block rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm hover:border-teal-700">
                      {name} vs {providerName(other)}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </section>
      ) : null}

      <FaqList faqs={faqs} />

      <p className="mt-10 text-sm text-stone-500">
        Read the <Link href="/methodology" className="underline underline-offset-2 hover:text-stone-900">methodology</Link> and the{" "}
        <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-stone-900">affiliate disclosure</Link>.
      </p>

      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd data={faqJsonLd(faqs)} />
    </div>
  );
}
