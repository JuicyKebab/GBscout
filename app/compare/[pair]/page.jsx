import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FactsTable, { FairUseNotes } from "@/components/FactsTable";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import { planLabel } from "@/components/PlanTable";
import { getComparison, providersWithData } from "@/lib/data";
import { fullDate, money } from "@/lib/format";
import { PAIRS, pairSlug, parsePair, providerName } from "@/lib/providers";
import { breadcrumbJsonLd } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return PAIRS.map((p) => ({ pair: pairSlug(p) }));
}

const METRIC = {
  perGb: {
    lower: "the lower best price per GB",
    column: "Lowest price per GB",
    cell: (r) => r.perGb,
    method:
      "For every destination both providers cover, we take each provider's lowest price per GB across its fixed-data plans and compare those. Unlimited plans are left out of this count because they have no GB to divide by.",
    note: "",
  },
  unlimited7: {
    lower: "the lower price for a 7-day unlimited plan",
    column: "7-day unlimited plan",
    cell: (r) => r.price,
    method:
      "At least one of the two providers sells no fixed-data plans, so a price per GB cannot be compared. Instead we compare the price of each provider's 7-day unlimited plan in every destination both cover. Unlimited plans can slow down after a daily amount of data, so the providers' own limits are quoted below.",
    note: " Unlimited plans can slow down after a daily amount of data; the limits each provider states are quoted below.",
  },
};

function summary(c) {
  const { a, b, shared, wins, mode } = c;
  const m = METRIC[mode];
  const n = shared.length;
  const ties = n - wins[a] - wins[b];
  const date = fullDate(c.fetchedAt);
  const lead = wins[a] === wins[b] ? null : wins[a] > wins[b] ? a : b;
  const trail = lead ? (lead === a ? b : a) : null;
  const sentence = lead
    ? `${providerName(lead)} has ${m.lower} in ${wins[lead]} of the ${n} destinations that both ${providerName(a)} and ${providerName(b)} cover; ${providerName(trail)} is cheaper in ${wins[trail]}${ties ? ` and ${ties} ${ties === 1 ? "is" : "are"} level` : ""}.`
    : `${providerName(a)} and ${providerName(b)} each have ${m.lower} in ${wins[a]} of the ${n} destinations they both cover${ties ? `, with ${ties} level` : ""}.`;
  return `${date ? `As of ${date}: ` : ""}${sentence}${m.note} Price is only one part of the choice: this comparison does not measure network quality or speed.`;
}

export async function generateMetadata({ params }) {
  const { pair } = await params;
  const p = parsePair(pair);
  if (!p) return {};
  const c = getComparison(p[0], p[1]);
  const canonical = `/compare/${pair}`;
  const names = `${providerName(p[0])} vs ${providerName(p[1])}`;
  if (!c.hasPage) return { title: names, alternates: { canonical }, robots: { index: false, follow: true } };
  const what = c.mode === "unlimited7" ? "7-day unlimited plan prices" : "lowest price per GB";
  return {
    title: `${names} (${new Date().getFullYear()}): eSIM prices compared in ${c.shared.length} destinations`,
    description: `${names}: ${what} compared across ${c.shared.length} destinations${c.fetchedAt ? `, prices checked ${fullDate(c.fetchedAt)}` : ""}.`,
    alternates: { canonical },
  };
}

export default async function ComparePage({ params }) {
  const { pair } = await params;
  const p = parsePair(pair);
  if (!p) notFound();
  const [a, b] = p;
  const c = getComparison(a, b);
  if (!c.hasPage) notFound();
  const m = METRIC[c.mode];
  const trail = [
    { name: "Home", path: "/" },
    { name: `${providerName(a)} vs ${providerName(b)}`, path: `/compare/${pair}` },
  ];
  const text = summary(c);
  const faqs = [
    { q: `Is ${providerName(a)} cheaper than ${providerName(b)}?`, a: text },
    { q: "How do you compare the two providers?", a: m.method },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 max-w-3xl text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">
        {providerName(a)} vs {providerName(b)}: eSIM prices compared in {c.shared.length} destinations
      </h1>
      <p className="mt-4 max-w-3xl text-base text-pretty text-stone-800 sm:text-lg">{text}</p>

      <section aria-labelledby="by-destination" className="mt-12">
        <h2 id="by-destination" className="text-2xl font-semibold text-balance text-stone-900">{m.column} by destination</h2>
        <div className="relative mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white px-5 py-2">
          <table className="w-full min-w-[40rem] text-sm">
            <caption className="sr-only">{m.column} for {providerName(a)} and {providerName(b)} by destination</caption>
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase text-stone-500">
                <th scope="col" className="py-2 pr-4 font-medium">Destination</th>
                <th scope="col" className="py-2 pr-4 font-medium">{providerName(a)}</th>
                <th scope="col" className="py-2 pr-4 font-medium">{providerName(b)}</th>
                <th scope="col" className="py-2 font-medium">Cheaper</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {c.shared.map((s) => (
                <tr key={s.destination.slug}>
                  <th scope="row" className="py-3 pr-4 text-left font-medium text-stone-900">
                    <Link href={`/esim/${s.destination.slug}`} className="underline-offset-2 hover:underline">{s.destination.name}</Link>
                  </th>
                  <td className="py-3 pr-4 tabular-nums text-stone-800">
                    {money(m.cell(s.a), s.currency)}
                    {c.mode === "perGb" ? <span className="block text-xs text-stone-500">{planLabel(s.a)}</span> : null}
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-stone-800">
                    {money(m.cell(s.b), s.currency)}
                    {c.mode === "perGb" ? <span className="block text-xs text-stone-500">{planLabel(s.b)}</span> : null}
                  </td>
                  <td className="py-3 font-medium text-teal-800">{s.winner ? providerName(s.winner) : "Level"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <FactsTable a={a} b={b} />
      <FairUseNotes providers={[a, b]} />
      <FaqList faqs={faqs} />

      <section aria-labelledby="more-compare" className="mt-12">
        <h2 id="more-compare" className="text-lg font-semibold text-stone-900">Keep comparing</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {[a, b].filter((x) => providersWithData().includes(x)).map((x) => (
            <li key={x}>
              <Link href={`/providers/${x}`} className="inline-block rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm hover:border-teal-700">
                {providerName(x)} eSIM review
              </Link>
            </li>
          ))}
          {PAIRS.filter((q) => pairSlug(q) !== pair).map((q) => (
            <li key={pairSlug(q)}>
              <Link href={`/compare/${pairSlug(q)}`} className="inline-block rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm hover:border-teal-700">
                {providerName(q[0])} vs {providerName(q[1])}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-stone-500">
        Read the <Link href="/methodology" className="underline underline-offset-2 hover:text-stone-900">methodology</Link> and the{" "}
        <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-stone-900">affiliate disclosure</Link>.
      </p>

      <JsonLd data={breadcrumbJsonLd(trail)} />
    </div>
  );
}
