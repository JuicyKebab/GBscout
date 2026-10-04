import { getFacts } from "@/lib/data";
import { providerName } from "@/lib/providers";

// Geselecteerde, vergelijkbare velden uit data/providers-facts.json (bronvermeld, met datum).
const ROWS = [
  ["founded_year", "Founded"],
  ["hq_country", "Registered in"],
  ["destinations_count", "Destinations (provider's claim)"],
  ["plan_unlimited", "Unlimited plans"],
  ["hotspot", "Hotspot / tethering"],
  ["topup", "Top-up of an existing eSIM"],
  ["phone_number_calls_sms", "Calls / SMS included"],
  ["validity_max_days", "Longest validity (days)"],
];

function format(field) {
  const v = field?.value;
  if (v == null) return null;
  if (typeof v === "boolean") return { main: v ? "Yes" : "No" };
  if (typeof v === "object" && !Array.isArray(v)) {
    const flag = ["allowed", "possible", "included"].find((k) => typeof v[k] === "boolean");
    const detail = v.details || v.conditions || null;
    if (flag) return { main: v[flag] ? "Yes" : "No", detail };
    return { main: Object.values(v).map(String).join(", ") };
  }
  if (Array.isArray(v)) return { main: v.join(", ") };
  return { main: String(v) };
}

function Cell({ field }) {
  const f = format(field);
  if (!f) return <span className="text-stone-400">Not verified</span>;
  return (
    <>
      <span className="text-stone-800">{f.main}</span>
      {field.source ? (
        <a href={field.source} rel="noopener nofollow" target="_blank" className="ml-1 text-xs text-stone-500 underline underline-offset-2 hover:text-stone-800">
          source
        </a>
      ) : null}
      {f.detail ? <span className="mt-1 block line-clamp-3 text-xs text-stone-500">{f.detail}</span> : null}
    </>
  );
}

export default function FactsTable({ a, b }) {
  const facts = getFacts();
  const fa = facts[a] || {};
  const fb = facts[b] || {};
  const rows = ROWS.filter(([k]) => format(fa[k]) || format(fb[k]));
  if (!rows.length) return null;
  return (
    <section aria-labelledby="facts" className="mt-12">
      <h2 id="facts" className="text-2xl font-semibold text-balance text-stone-900">What each provider states</h2>
      <p className="mt-2 text-sm text-stone-600">Taken from each provider's own pages; every value links to its source. Where we could not verify a fact, the table says so.</p>
      <div className="relative mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white px-5 py-2">
        <table className="w-full min-w-[36rem] text-sm">
          <caption className="sr-only">{providerName(a)} and {providerName(b)} compared on provider-stated facts</caption>
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs uppercase text-stone-500">
              <th scope="col" className="py-2 pr-4 font-medium">Topic</th>
              <th scope="col" className="py-2 pr-4 font-medium">{providerName(a)}</th>
              <th scope="col" className="py-2 font-medium">{providerName(b)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map(([k, label]) => (
              <tr key={k}>
                <th scope="row" className="py-3 pr-4 text-left font-medium text-stone-900">{label}</th>
                <td className="py-3 pr-4 align-top"><Cell field={fa[k]} /></td>
                <td className="py-3 align-top"><Cell field={fb[k]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Volledigere feitenlijst voor één provider (provider-overzichtspagina).
const PROVIDER_ROWS = [
  ["founded_year", "Founded"],
  ["parent_company", "Legal entity"],
  ["hq_country", "Registered in"],
  ["destinations_count", "Destinations (provider's claim)"],
  ["plan_fixed_data", "Fixed-data plans"],
  ["plan_unlimited", "Unlimited plans"],
  ["unlimited_fair_use", "Unlimited fair-use limit"],
  ["hotspot", "Hotspot / tethering"],
  ["topup", "Top-up of an existing eSIM"],
  ["phone_number_calls_sms", "Calls / SMS included"],
  ["validity_min_days", "Shortest validity (days)"],
  ["validity_max_days", "Longest validity (days)"],
  ["refund_policy", "Refund policy"],
  ["app_required", "App required"],
  ["trustpilot", "Trustpilot"],
];

/** Feitentabel voor één provider, bronvermeld (data/providers-facts.json). */
export function ProviderFacts({ provider }) {
  const f = getFacts()[provider] || {};
  const rows = PROVIDER_ROWS.filter(([k]) => format(f[k]));
  if (!rows.length) return null;
  return (
    <section aria-labelledby="facts" className="mt-12">
      <h2 id="facts" className="text-2xl font-semibold text-balance text-stone-900">What {providerName(provider)} states</h2>
      <p className="mt-2 text-sm text-stone-600">From {providerName(provider)}'s own pages; every value links to its source. Where we could not verify a fact, the table says so.</p>
      <div className="relative mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white px-5 py-2">
        <table className="w-full min-w-[20rem] text-sm">
          <caption className="sr-only">{providerName(provider)} provider-stated facts</caption>
          <tbody className="divide-y divide-stone-100">
            {rows.map(([k, label]) => (
              <tr key={k}>
                <th scope="row" className="w-1/2 py-3 pr-4 text-left font-medium text-stone-900">{label}</th>
                <td className="py-3 align-top"><Cell field={f[k]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Wat providers zelf zeggen over limieten bij "onbeperkte" plannen. */
export function FairUseNotes({ providers }) {
  const facts = getFacts();
  const items = providers
    .map((p) => ({ p, f: facts[p]?.unlimited_fair_use }))
    .filter((x) => x.f?.value);
  if (!items.length) return null;
  return (
    <section aria-labelledby="fair-use" className="mt-12">
      <h2 id="fair-use" className="text-2xl font-semibold text-balance text-stone-900">"Unlimited" plans: what the providers say about limits</h2>
      <p className="mt-2 text-sm text-stone-600">Unlimited plans often slow down after a daily amount of data. These are the providers' own statements.</p>
      <ul className="mt-4 space-y-3">
        {items.map(({ p, f }) => (
          <li key={p} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="font-semibold text-stone-900">{providerName(p)}</p>
            <p className="mt-1 text-sm text-pretty text-stone-700">{f.value}</p>
            {f.source ? (
              <a href={f.source} rel="noopener nofollow" target="_blank" className="mt-2 inline-block text-xs text-stone-500 underline underline-offset-2 hover:text-stone-800">
                source
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
