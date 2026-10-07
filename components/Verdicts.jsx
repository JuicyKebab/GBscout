import { money } from "@/lib/format";
import { providerName } from "@/lib/providers";
import { planLabel } from "./PlanTable";

function Card({ title, row, currency, line, note }) {
  if (!row) return null;
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-xs font-medium uppercase text-stone-500">{title}</p>
      <p className="mt-2 text-lg font-semibold text-stone-900">{providerName(row.provider)}</p>
      <p className="text-sm text-stone-700">{planLabel(row)}</p>
      <p className="mt-3 text-2xl font-semibold text-teal-800 tabular-nums">{money(row.price, currency)}</p>
      <p className="mt-1 text-sm text-stone-600 tabular-nums">{line(row)}</p>
      {note ? <p className="mt-2 text-xs text-stone-500">{note}</p> : null}
    </div>
  );
}

export default function Verdicts({ offers }) {
  const { verdicts, currency } = offers;
  if (!verdicts.lowestPerGb && !verdicts.cheapest5gb && !verdicts.cheapestUnlimited) return null;
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      <Card
        title="Lowest price per GB"
        row={verdicts.lowestPerGb}
        currency={currency}
        line={(r) => `${money(r.perGb, currency)} per GB`}
        note="Plans of 3 GB or more."
      />
      <Card
        title="Cheapest 5 GB+ plan"
        row={verdicts.cheapest5gb}
        currency={currency}
        line={(r) => `${money(r.perGb, currency)} per GB`}
        note="Valid for 7 days or longer."
      />
      <Card
        title="Cheapest unlimited plan"
        row={verdicts.cheapestUnlimited}
        currency={currency}
        line={(r) => `${money(r.perDay, currency)} per day`}
        note="Valid for 7 days or longer. Check the provider's fair-use terms."
      />
    </div>
  );
}
