// Prijsgeschiedenis: voegt één dagsnapshot per bestemming toe aan data/price-history.json.
// Draait na ingest + check-data (zie .github/workflows/refresh.yml). Geen DB nodig: het bestand
// wordt mee gecommit door de refresh-workflow; de git-historie is de back-up.
//
// Per bestemming loggen we de twee cijfers die de site als kop toont:
//   gb  = laagste prijs per GB (vaste plannen, USD) -- dezelfde keuze als verdicts.lowestPerGb
//   u7  = goedkoopste 7-daags unlimited plan (USD), of weggelaten
// Alleen bestemmingen met >= 2 providers (USD) worden gelogd: dat zijn de gepubliceerde pagina's.
// Datumsleutel = de generated_at-datum van de dataset (idempotent: zelfde dag overschrijft).
import fs from "node:fs";

const CURRENCY = "USD";
const MIN_PROVIDERS = 2;
const KEEP_DAYS = 365; // oudere snapshots afkappen zodat het bestand niet onbeperkt groeit
const PLANS = "data/plans.json";
const OUT = "data/price-history.json";

const round = (n) => Math.round(n * 100) / 100;

function snapshot(items) {
  const bySlug = new Map();
  for (const it of items) {
    if (it.currency !== CURRENCY) continue; // geen valuta's mengen (geen verzonnen koersen)
    const g = bySlug.get(it.slug) || { providers: new Set(), fixed: [], unl7: [] };
    g.providers.add(it.provider);
    for (const p of it.plans || []) {
      const price = Number(p.price);
      if (!(price > 0)) continue;
      if (!p.unlimited && Number(p.data_gb) > 0) g.fixed.push({ perGb: price / Number(p.data_gb), dataGb: Number(p.data_gb) });
      else if (p.unlimited && Number(p.validity_days) === 7) g.unl7.push(price);
    }
    bySlug.set(it.slug, g);
  }
  const out = {};
  for (const [slug, g] of bySlug) {
    if (g.providers.size < MIN_PROVIDERS) continue;
    const fixed = g.fixed.sort((a, b) => a.perGb - b.perGb);
    const lowest = fixed.find((r) => r.dataGb >= 3) || fixed[0] || null; // = verdicts.lowestPerGb
    const entry = {};
    if (lowest) entry.gb = round(lowest.perGb);
    if (g.unl7.length) entry.u7 = round(Math.min(...g.unl7));
    if (Object.keys(entry).length) out[slug] = entry;
  }
  return out;
}

function main() {
  const dataset = JSON.parse(fs.readFileSync(PLANS, "utf8"));
  const items = dataset.items || [];
  const date = (dataset.generated_at || new Date().toISOString()).slice(0, 10); // YYYY-MM-DD

  let history = {};
  try {
    history = JSON.parse(fs.readFileSync(OUT, "utf8"));
  } catch {
    history = {};
  }

  const snap = snapshot(items);
  const slugCount = Object.keys(snap).length;
  if (!slugCount) {
    console.error("log-prices: snapshot is empty, not writing (plans.json broken?)");
    process.exit(1);
  }
  history[date] = snap;

  // Afkappen op de nieuwste KEEP_DAYS datums.
  const dates = Object.keys(history).sort();
  for (const d of dates.slice(0, Math.max(0, dates.length - KEEP_DAYS))) delete history[d];

  fs.writeFileSync(OUT, JSON.stringify(history) + "\n");
  console.log(`log-prices: wrote ${date} (${slugCount} destinations); ${Object.keys(history).length} days on file.`);
}

main();
