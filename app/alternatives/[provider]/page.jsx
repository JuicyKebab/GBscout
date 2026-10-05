import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import { getAlternatives } from "@/lib/data";
import { fullDate } from "@/lib/format";
import { PAIRS, PROVIDER_SLUGS, pairSlug, providerName } from "@/lib/providers";
import { breadcrumbJsonLd } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROVIDER_SLUGS.map((provider) => ({ provider }));
}

function comparePath(x, y) {
  const hit = PAIRS.find(([p, q]) => (p === x && q === y) || (p === y && q === x));
  return hit ? `/compare/${pairSlug(hit)}` : null;
}

export async function generateMetadata({ params }) {
  const { provider } = await params;
  if (!PROVIDER_SLUGS.includes(provider)) return {};
  const alts = getAlternatives(provider);
  const canonical = `/alternatives/${provider}`;
  if (!alts.length) return { title: `${providerName(provider)} alternatives`, alternates: { canonical }, robots: { index: false, follow: true } };
  return {
    title: `${providerName(provider)} alternatives (${new Date().getFullYear()}): ${alts.length} eSIM providers compared on price`,
    description: `Compare ${providerName(provider)} with ${alts.map((a) => providerName(a.provider)).join(", ")} on price across the destinations they share.`,
    alternates: { canonical },
  };
}

export default async function AlternativesPage({ params }) {
  const { provider } = await params;
  if (!PROVIDER_SLUGS.includes(provider)) notFound();
  const alts = getAlternatives(provider);
  if (!alts.length) notFound();
  const name = providerName(provider);
  const trail = [
    { name: "Home", path: "/" },
    { name: `${name} alternatives`, path: `/alternatives/${provider}` },
  ];
  const dates = alts.map((a) => a.comparison.fetchedAt).filter(Boolean).sort();
  const date = fullDate(dates[0]);
  const faqs = [
    {
      q: `What are the best alternatives to ${name}?`,
      a: `On price per GB, we compared ${name} with ${alts.map((a) => providerName(a.provider)).join(", ")}. The table above shows in how many shared destinations each alternative is cheaper than ${name}. Price is one factor among several: we do not measure network quality, speed or support.`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 max-w-3xl text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">
        {name} alternatives: {alts.length} eSIM providers compared on price
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-pretty text-stone-800">
        {date ? `As of ${date}, we` : "We"} compared {name} with {alts.length} other eSIM {alts.length === 1 ? "provider" : "providers"} on the
        destinations they share. For each one the table shows how many destinations it has in common with {name} and in how many of
        them it is cheaper. Providers that sell fixed-data plans are compared on lowest price per GB; the others on the price of a
        7-day unlimited plan. Network quality and speed are not part of this comparison.
      </p>

      <section aria-labelledby="table" className="mt-12">
        <h2 id="table" className="text-2xl font-semibold text-balance text-stone-900">Alternatives to {name} by price</h2>
        <div className="relative mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white px-5 py-2">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">Providers compared with {name} on price per GB</caption>
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase text-stone-500">
                <th scope="col" className="py-2 pr-4 font-medium">Provider</th>
                <th scope="col" className="py-2 pr-4 font-medium">Shared destinations</th>
                <th scope="col" className="py-2 pr-4 font-medium">Cheaper than {name}</th>
                <th scope="col" className="py-2 font-medium"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {alts.map(({ provider: other, comparison }) => {
                const path = comparePath(provider, other);
                return (
                  <tr key={other}>
                    <th scope="row" className="py-3 pr-4 text-left font-medium text-stone-900">{providerName(other)}</th>
                    <td className="py-3 pr-4 tabular-nums text-stone-700">{comparison.shared.length}</td>
                    <td className="py-3 pr-4 tabular-nums text-stone-700">
                      {comparison.wins[other]} of {comparison.shared.length}
                    </td>
                    <td className="py-3 text-right">
                      {path ? (
                        <Link href={path} className="text-sm font-medium text-teal-800 underline-offset-2 hover:underline">
                          {name} vs {providerName(other)}
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <FaqList faqs={faqs} />

      <p className="mt-10 text-sm text-stone-500">
        Read the <Link href="/methodology" className="underline underline-offset-2 hover:text-stone-900">methodology</Link> and the{" "}
        <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-stone-900">affiliate disclosure</Link>.
      </p>

      <JsonLd data={breadcrumbJsonLd(trail)} />
    </div>
  );
}
