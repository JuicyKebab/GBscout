import Link from "next/link";
import DestinationSearch from "@/components/DestinationSearch";
import { DESTINATIONS } from "@/lib/destinations";
import { getPopular, getDatasetMeta, getOffers, validPairs } from "@/lib/data";
import { money, fullDate, plural } from "@/lib/format";
import { pairSlug, providerName } from "@/lib/providers";

export const metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const popular = getPopular(12);
  const withData = DESTINATIONS.filter((d) => getOffers(d.slug).hasPage);
  const providers = new Set(withData.flatMap((d) => getOffers(d.slug).providers));
  const meta = getDatasetMeta();
  const pairs = validPairs();
  const searchList = DESTINATIONS.map((d) => ({ slug: d.slug, name: d.name, soon: !getOffers(d.slug).hasPage }));

  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-14 sm:py-20">
        <h1 className="max-w-3xl text-4xl font-semibold text-balance text-stone-900 sm:text-5xl">
          Compare eSIM prices by cost per GB, and see exactly when we checked
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-pretty text-stone-700">
          Other sites list every provider. GBScout ranks every plan by price per gigabyte (and unlimited plans by price
          per day), shows the date each price was verified, and points you to the few worth buying for your destination.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-pretty text-stone-500">
          We rank on price only and link you straight to the provider. We may earn a commission if you buy; it never
          changes the order.
        </p>
        <div className="mt-8">
          <DestinationSearch destinations={searchList} />
        </div>
        {withData.length ? (
          <p className="mt-4 text-sm text-stone-500 tabular-nums">
            {plural(providers.size, "provider")}, {plural(withData.length, "destination")}
            {meta.generatedAt ? `, prices checked ${fullDate(meta.generatedAt)}` : ""}.
          </p>
        ) : null}
      </section>

      <section id="destinations" aria-labelledby="popular" className="scroll-mt-4">
        <h2 id="popular" className="text-2xl font-semibold text-balance text-stone-900">Popular destinations</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/esim/${d.slug}`}
                className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                <span className="font-semibold text-stone-900">eSIM for {d.name}</span>
                <span className="mt-1 block text-sm text-stone-600 tabular-nums">
                  {d.from ? `From ${money(d.from.perGb, d.currency)} per GB` : "Prices coming soon"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how" className="mt-14">
        <h2 id="how" className="text-2xl font-semibold text-balance text-stone-900">How the ranking works</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold text-stone-900">Price per GB</h3>
            <p className="mt-2 text-sm text-pretty text-stone-700">
              Fixed-data plans are ranked by what each gigabyte costs, so a 20 GB plan and a 1 GB plan can be compared
              fairly.
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold text-stone-900">Unlimited plans, by trip length</h3>
            <p className="mt-2 text-sm text-pretty text-stone-700">
              Unlimited plans have no GB to divide by, so you pick your number of days and see the cheapest plan for that length.
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold text-stone-900">Dated prices</h3>
            <p className="mt-2 text-sm text-pretty text-stone-700">
              Every page shows when its oldest price was checked. Read the{" "}
              <Link href="/methodology" className="underline underline-offset-2 hover:text-stone-900">methodology</Link> for
              what the numbers do not tell you.
            </p>
          </div>
        </div>
      </section>

      {pairs.length ? (
        <section id="compare" aria-labelledby="providers" className="mt-14 scroll-mt-4">
          <h2 id="providers" className="text-2xl font-semibold text-balance text-stone-900">Compare providers</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {pairs.map((p) => (
              <li key={pairSlug(p)}>
                <Link
                  href={`/compare/${pairSlug(p)}`}
                  className="block rounded-xl border border-stone-200 bg-white p-4 font-medium text-stone-900 hover:border-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  {providerName(p[0])} vs {providerName(p[1])}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
