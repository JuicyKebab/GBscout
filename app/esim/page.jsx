import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { getPopular } from "@/lib/data";
import { DESTINATIONS } from "@/lib/destinations";
import { money } from "@/lib/format";
import { providerName } from "@/lib/providers";
import { breadcrumbJsonLd } from "@/lib/schema";

// Hub: linkt ELKE bestemming met prijzen, zodat de long-tail niet alleen in de sitemap staat
// (één hop vanaf de homepage, via footer sitebreed bereikbaar).
export const metadata = {
  title: "All eSIM destinations compared by price per GB",
  description:
    "Every destination we compare, ranked by the lowest eSIM price per GB. Countries and regions with verified prices from multiple providers.",
  alternates: { canonical: "/esim" },
};

export default function AllDestinationsPage() {
  const all = getPopular(DESTINATIONS.length).filter((d) => d.hasPage);
  const regions = all.filter((d) => d.type === "region");
  const countries = all.filter((d) => d.type !== "region");
  const trail = [
    { name: "Home", path: "/" },
    { name: "All destinations", path: "/esim" },
  ];

  const Card = (d) => (
    <li key={d.slug}>
      <Link
        href={`/esim/${d.slug}`}
        className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm hover:border-teal-700"
      >
        <span className="text-stone-900">{d.name}</span>
        {d.from ? <span className="tabular-nums text-stone-500">{money(d.from.perGb, d.currency)}/GB</span> : null}
      </Link>
    </li>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 max-w-3xl text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">
        All eSIM destinations, ranked by price per GB
      </h1>
      <p className="mt-4 max-w-3xl text-base text-pretty text-stone-800 sm:text-lg">
        Every destination with verified prices from at least two providers. The price shown is the lowest we found per GB.
        Pick a destination to see the full ranking and when its prices were checked.
      </p>

      {regions.length ? (
        <section aria-labelledby="regions" className="mt-10">
          <h2 id="regions" className="text-lg font-semibold text-stone-900">Regions</h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{regions.map(Card)}</ul>
        </section>
      ) : null}

      <section aria-labelledby="countries" className="mt-10">
        <h2 id="countries" className="text-lg font-semibold text-stone-900">Countries</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{countries.map(Card)}</ul>
      </section>

      <JsonLd data={breadcrumbJsonLd(trail)} />
    </div>
  );
}
