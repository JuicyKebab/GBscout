import { money, gb, days } from "@/lib/format";
import { outbound, providerName } from "@/lib/providers";

export function planLabel(r) {
  const size = r.unlimited ? "Unlimited" : gb(r.dataGb);
  return `${size}, ${days(r.days)}`;
}

// Airalo noemt plannen "Operatornaam: 5 GB - 30 days". Alleen het deel voor de dubbele punt
// is informatie (de merknaam van het plan); de rest staat al in de kolommen.
function operatorOf(r) {
  if (!r.name || !r.name.includes(":")) return null;
  return r.name.split(":")[0].trim() || null;
}

function Rows({ rows, currency, mode, subid, startAt = 0, prev = null }) {
  return rows.map((r, i) => {
    const link = outbound(r.provider, { url: r.sourceUrl, subid });
    // Vast: de laagste prijs per GB. Unlimited: de goedkoopste per reisduur (de tabel staat op duur).
    const before = i === 0 ? prev : rows[i - 1];
    const best = mode === "unlimited" ? !before || before.days !== r.days : startAt + i === 0;
    return (
      <tr key={`${r.provider}-${r.dataGb}-${r.days}-${r.price}-${i}`} className={best ? "bg-teal-50" : ""}>
        <td className="py-3 pr-4 font-medium text-stone-900">{providerName(r.provider)}</td>
        <td className="py-3 pr-4 text-stone-700">
          {r.unlimited ? "Unlimited" : gb(r.dataGb)}
          {operatorOf(r) ? <span className="block text-xs text-stone-500">{operatorOf(r)}</span> : null}
        </td>
        <td className="py-3 pr-4 text-stone-700 tabular-nums">{days(r.days)}</td>
        <td className="py-3 pr-4 text-stone-900 tabular-nums">{money(r.price, currency)}</td>
        <td className="py-3 pr-4 text-stone-900 tabular-nums">
          {money(mode === "unlimited" ? r.perDay : r.perGb, currency)}
          {best ? (
            <span className="ml-2 rounded-full bg-teal-700 px-2 py-0.5 text-xs font-medium text-white">
              {mode === "unlimited" ? "Cheapest" : "Lowest"}
            </span>
          ) : null}
        </td>
        <td className="py-3 text-right">
          <a
            href={link.href}
            rel={link.rel}
            target="_blank"
            aria-label={`Buy the ${planLabel(r)} plan at ${providerName(r.provider)} (opens in a new tab)`}
            className="inline-block rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Buy on {providerName(r.provider)} &rarr;
          </a>
        </td>
      </tr>
    );
  });
}

export default function PlanTable({ rows, currency, mode = "fixed", subid, caption, initial = 10 }) {
  if (!rows.length) return null;
  const head = rows.slice(0, initial);
  const rest = rows.slice(initial);
  const unitLabel = mode === "unlimited" ? "Price per day" : "Price per GB";
  const Header = (
    <thead>
      <tr className="border-b border-stone-200 text-left text-xs uppercase text-stone-500">
        <th scope="col" className="py-2 pr-4 font-medium">Provider</th>
        <th scope="col" className="py-2 pr-4 font-medium">Data</th>
        <th scope="col" className="py-2 pr-4 font-medium">Validity</th>
        <th scope="col" className="py-2 pr-4 font-medium">Price</th>
        <th scope="col" className="py-2 pr-4 font-medium">{unitLabel}</th>
        <th scope="col" className="py-2 text-right font-medium"><span className="sr-only">Action</span></th>
      </tr>
    </thead>
  );
  return (
    <div className="relative overflow-x-auto rounded-xl border border-stone-200 bg-white px-5 py-2">
      <table className="w-full min-w-[40rem] text-sm">
        <caption className="sr-only">{caption}</caption>
        {Header}
        <tbody className="divide-y divide-stone-100">
          <Rows rows={head} currency={currency} mode={mode} subid={subid} />
        </tbody>
      </table>
      {rest.length ? (
        <details className="border-t border-stone-100 py-2">
          <summary className="cursor-pointer py-1 text-sm font-medium text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            Show {rest.length} more plans
          </summary>
          <table className="mt-2 w-full min-w-[40rem] text-sm">
            <caption className="sr-only">{caption} (continued)</caption>
            {Header}
            <tbody className="divide-y divide-stone-100">
              <Rows rows={rest} currency={currency} mode={mode} subid={subid} startAt={initial} prev={head[head.length - 1]} />
            </tbody>
          </table>
        </details>
      ) : null}
    </div>
  );
}
