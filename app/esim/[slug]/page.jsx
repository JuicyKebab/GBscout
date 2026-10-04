import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import PlanTable, { planLabel } from "@/components/PlanTable";
import Verdicts from "@/components/Verdicts";
import { DESTINATIONS, getDestination, forName } from "@/lib/destinations";
import { getOffers } from "@/lib/data";
import { days, fullDate, money, plural } from "@/lib/format";
import { outbound, providerName } from "@/lib/providers";
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) return {};
  const o = getOffers(slug);
  const canonical = `/esim/${slug}`;
  if (!o.hasPage) {
    return { title: `eSIM for ${forName(d)}`, alternates: { canonical }, robots: { index: false, follow: true } };
  }
  const l = o.verdicts.lowestPerGb;
  const date = fullDate(o.fetchedAt);
  return {
    title: `Best eSIM for ${forName(d)} (${new Date().getFullYear()}): ${plural(o.providers.length, "provider")} compared`,
    description: `Compare ${o.rows.length} eSIM plans for ${forName(d)}.${l ? ` Lowest price per GB: ${providerName(l.provider)} at ${money(l.perGb, o.currency)}.` : ""}${date ? ` Prices checked ${date}.` : ""}`,
    alternates: { canonical },
  };
}

function answerText(d, o) {
  const date = fullDate(o.fetchedAt);
  const { lowestPerGb: l, cheapest5gb: c5, cheapestUnlimited: cu } = o.verdicts;
  const parts = [
    `${date ? `As of ${date}, we` : "We"} compared ${o.rows.length} plans from ${plural(o.providers.length, "provider")} for ${forName(d)}.`,
  ];
  if (l) parts.push(`Among fixed-data plans, the lowest price per GB is ${providerName(l.provider)} at ${money(l.perGb, o.currency)} per GB (${planLabel(l)}, ${money(l.price, o.currency)}).`);
  if (c5) parts.push(`The cheapest plan with 5 GB or more and at least 7 days of validity is ${providerName(c5.provider)}, ${planLabel(c5)}, at ${money(c5.price, o.currency)}.`);
  if (cu) parts.push(`The cheapest unlimited plan of 7 days or longer is ${providerName(cu.provider)} at ${money(cu.price, o.currency)} for ${days(cu.days)}.`);
  parts.push("Prices change often, so check the provider's page before you buy.");
  return parts.join(" ");
}

function faqsFor(d, o) {
  const fixedPrices = o.fixed.map((r) => r.price);
  const perGb = o.fixed.map((r) => r.perGb);
  const faqs = [{ q: `What is the cheapest eSIM for ${forName(d)}?`, a: answerText(d, o) }];
  if (fixedPrices.length) {
    const unl = o.unlimited.length ? ` Unlimited plans start at ${money(Math.min(...o.unlimited.map((r) => r.price)), o.currency)}.` : "";
    faqs.push({
      q: `How much does an eSIM for ${forName(d)} cost?`,
      a: `The fixed-data plans we found cost between ${money(Math.min(...fixedPrices), o.currency)} and ${money(Math.max(...fixedPrices), o.currency)}, which works out to ${money(Math.min(...perGb), o.currency)} to ${money(Math.max(...perGb), o.currency)} per GB.${unl}`,
    });
  }
  faqs.push({
    q: "Which providers do you compare for this destination?",
    a: `${o.providers.map(providerName).join(", ")}. A provider is listed only when we have verified prices for this destination.`,
  });
  faqs.push({
    q: "Do I need an unlocked phone for an eSIM?",
    a: "Yes. An eSIM needs a phone that supports eSIM and is not locked to a carrier. Check your phone's settings or the manufacturer's list before you buy, and install the eSIM before you travel if you can.",
  });
  return faqs;
}

export default async function DestinationPage({ params }) {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) notFound();
  const o = getOffers(slug);
  const trail = [
    { name: "Home", path: "/" },
    { name: `eSIM for ${forName(d)}`, path: `/esim/${slug}` },
  ];

  if (!o.hasPage) {
    const others = DESTINATIONS.filter((x) => x.slug !== slug && getOffers(x.slug).hasPage).slice(0, 8);
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs trail={trail} />
        <h1 className="mt-6 text-3xl font-semibold text-balance text-stone-900">eSIM for {forName(d)}</h1>
        <p className="mt-4 max-w-2xl text-pretty text-stone-700">
          We do not have enough verified prices for {forName(d)} yet, so we do not rank anything here. We only publish a
          comparison when at least two providers have verified prices for the destination.
        </p>
        {others.length ? (
          <>
            <h2 className="mt-8 text-lg font-semibold text-stone-900">Destinations with prices</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {others.map((x) => (
                <li key={x.slug}>
                  <Link href={`/esim/${x.slug}`} className="inline-block rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm hover:border-teal-700">
                    {x.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    );
  }

  const faqs = faqsFor(d, o);
  const anyAffiliate = o.providers.some((p) => outbound(p, {}).affiliate);
  const subid = `esim-${slug}`;
  const date = fullDate(o.fetchedAt);
  // Roterend venster i.p.v. altijd de top-8: elke bestemming linkt de 12 erna (rondlopend), zodat
  // interne links en link-equity gelijkmatig over de long-tail verdelen i.p.v. zich op te hopen bij
  // een handvol populaire landen. De /esim-hub linkt sowieso alles.
  const pageList = DESTINATIONS.filter((x) => getOffers(x.slug).hasPage);
  const pos = pageList.findIndex((x) => x.slug === slug);
  const others = [...pageList.slice(pos + 1), ...pageList.slice(0, pos)].slice(0, 12);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 max-w-3xl text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">
        Best eSIM for {forName(d)}: {plural(o.providers.length, "provider")} compared on price
      </h1>
      {date ? <p className="mt-2 text-sm text-stone-500">Prices checked {date}.</p> : null}
      <p className="mt-4 max-w-3xl text-base text-pretty text-stone-800 sm:text-lg">{answerText(d, o)}</p>

      <Verdicts offers={o} />

      {o.fixed.length ? (
        <section aria-labelledby="fixed" className="mt-12">
          <h2 id="fixed" className="text-2xl font-semibold text-balance text-stone-900">Fixed-data plans, ranked by price per GB</h2>
          <p className="mt-2 text-sm text-stone-600">The highlighted row has the lowest price per GB.</p>
          <div className="mt-4">
            <PlanTable rows={o.fixed} currency={o.currency} mode="fixed" subid={subid} caption={`eSIM plans for ${forName(d)} ranked by price per GB`} />
          </div>
        </section>
      ) : null}

      {o.unlimited.length ? (
        <section aria-labelledby="unlimited" className="mt-12">
          <h2 id="unlimited" className="text-2xl font-semibold text-balance text-stone-900">Unlimited plans, by trip length</h2>
          <p className="mt-2 text-sm text-stone-600">
            Pick your number of days; the cheapest plan for each length is highlighted. Unlimited plans can slow down after a daily
            amount of data. Read the provider's terms.
          </p>
          <div className="mt-4">
            <PlanTable rows={o.unlimited} currency={o.currency} mode="unlimited" subid={subid} caption={`Unlimited eSIM plans for ${forName(d)} by trip length`} />
          </div>
        </section>
      ) : null}

      {o.excluded.length ? (
        <p className="mt-6 text-sm text-stone-500">
          Not ranked: {o.excluded.map(providerName).join(", ")}. Their prices are shown in a different currency and we do not
          convert currencies.
        </p>
      ) : null}

      {anyAffiliate ? (
        <p className="mt-6 text-sm text-stone-500">
          We may earn a commission if you buy through links on this page. It does not change the ranking, which uses price only.
        </p>
      ) : null}

      <FaqList faqs={faqs} />

      <section aria-labelledby="more" className="mt-12">
        <h2 id="more" className="text-lg font-semibold text-stone-900">Other destinations</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {others.map((x) => (
            <li key={x.slug}>
              <Link href={`/esim/${x.slug}`} className="inline-block rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm hover:border-teal-700">
                {x.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/esim" className="inline-block rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-900 hover:border-teal-700">
              All destinations →
            </Link>
          </li>
        </ul>
        <p className="mt-6 text-sm text-stone-500">
          Price per GB says nothing about network quality or speed. See the{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-stone-900">methodology</Link> for what this ranking covers.
        </p>
      </section>

      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd
        data={itemListJsonLd({
          name: `eSIM plans for ${forName(d)} by price per GB`,
          rows: o.fixed.slice(0, 10),
          currency: o.currency,
          labelOf: (r) => `${providerName(r.provider)} ${planLabel(r)}`,
        })}
      />
      <JsonLd data={faqJsonLd(faqs)} />
    </div>
  );
}
