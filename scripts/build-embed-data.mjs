// Bouwt public/embed/esim-data.json uit data/plans.json: de compacte dataset die de
// embed-widgets (/embed/esim en /embed/data-calculator) client-side ophalen op een
// statische site. GEEN verzonnen prijzen: alles komt uit plans.json. Niet-USD rijen
// worden overgeslagen (de site rekent geen koersen om). Alleen bestemmingen met >= 2
// USD-providers komen erin, zoals de gepubliceerde /esim-pagina's.
//
// Draai: `npm run build-embed-data` (of `node scripts/build-embed-data.mjs`).
// Herdraai telkens plans.json verandert en commit de output mee.
import fs from "node:fs";
import { DESTINATIONS } from "../lib/destinations.js";
import { providerName } from "../lib/providers.js";

const CURRENCY = "USD";
const MIN_PROVIDERS = 2;
const PLANS = "data/plans.json";
const OUT = "public/embed/esim-data.json";

const round2 = (n) => Math.round(n * 100) / 100;
const round3 = (n) => Math.round(n * 1000) / 1000;
const nameOf = (slug) => DESTINATIONS.find((d) => d.slug === slug)?.name || slug;

function build() {
  const raw = JSON.parse(fs.readFileSync(PLANS, "utf8"));
  const items = (raw.items || []).filter((i) => i.currency === CURRENCY);

  const bySlug = new Map();
  for (const it of items) {
    const g = bySlug.get(it.slug) || { providers: new Set(), fixed: [], unlimited: [], dates: [] };
    g.providers.add(it.provider);
    if (it.fetched_at) g.dates.push(it.fetched_at);
    for (const p of it.plans || []) {
      const price = Number(p.price);
      const validity = Number(p.validity_days);
      const dataGb = p.data_gb == null ? null : Number(p.data_gb);
      if (!(price > 0) || !(validity > 0)) continue;
      const base = { provider: it.provider, network: p.network || null, name: p.plan_name || null, days: validity, price: round2(price) };
      if (p.unlimited) {
        g.unlimited.push({ ...base, perDay: round3(price / validity) });
      } else if (dataGb > 0) {
        g.fixed.push({ ...base, dataGb, perGb: round3(price / dataGb) });
      }
    }
    bySlug.set(it.slug, g);
  }

  const countries = {};
  let kept = 0;
  for (const [slug, g] of bySlug) {
    if (g.providers.size < MIN_PROVIDERS) continue;
    const fixed = g.fixed.sort((a, b) => a.perGb - b.perGb || a.price - b.price);
    const unlimited = g.unlimited.sort((a, b) => a.perDay - b.perDay || a.price - b.price);
    if (!fixed.length && !unlimited.length) continue;
    // Headline-plan = zelfde keuze als de site (verdicts.lowestPerGb): liefst >= 3 GB om
    // te voorkomen dat een piepklein 1GB/3d-plan met een lage per-GB de kop kaapt.
    const cheapestPerGb = fixed.find((r) => r.dataGb >= 3) || fixed[0] || null;
    const cheapestPerDay = unlimited[0] || null; // laagste prijs per dag
    // Compacte lijsten (zonder naam/netwerk) zodat de data-calculator de goedkoopste
    // dekkende GB kan kiezen; naam/netwerk zitten alleen in de twee headline-plannen.
    const slim = (r) => ({ provider: r.provider, days: r.days, price: r.price, ...(r.dataGb != null ? { dataGb: r.dataGb, perGb: r.perGb } : { perDay: r.perDay }) });
    countries[slug] = {
      name: nameOf(slug),
      providers: g.providers.size,
      checked: (g.dates.sort()[0] || "").slice(0, 10) || null, // oudste meting = leeftijd
      cheapestPerGb,
      cheapestPerDay,
      fixed: fixed.map(slim),
      unlimited: unlimited.map(slim),
    };
    kept++;
  }

  const sortedCountries = {};
  for (const slug of Object.keys(countries).sort((a, b) => countries[a].name.localeCompare(countries[b].name))) {
    sortedCountries[slug] = countries[slug];
  }

  const out = {
    generated_at: new Date().toISOString(),
    source_generated_at: raw.generated_at || null,
    currency: CURRENCY,
    site: "https://gbscout.com",
    providerNames: Object.fromEntries([...new Set(items.map((i) => i.provider))].map((p) => [p, providerName(p)])),
    countries: sortedCountries,
  };

  fs.mkdirSync("public/embed", { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out));
  const bytes = fs.statSync(OUT).size;
  console.log(`Wrote ${OUT}: ${kept} countries, ${(bytes / 1024).toFixed(1)} KB`);
}

build();
