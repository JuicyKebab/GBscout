// Data-laag. Leest data/plans.json (geschreven door scripts/ingest.mjs) en data/providers-facts.json
// (bronvermelde feiten per provider) op build-tijd. Er zit GEEN verzonnen prijs in: zonder data
// tonen pagina's een lege toestand en worden ze niet geindexeerd (zie `hasPage`).
import fs from "node:fs";
import path from "node:path";
import { SITE } from "./site";
import { DESTINATIONS } from "./destinations";
import { PROVIDER_SLUGS, PAIRS, destinationUrl } from "./providers";

// Standaard 2: een vergelijking heeft minstens twee providers nodig. Alleen voor een lokale
// preview met een enkele provider kan dit via MIN_PROVIDERS_FOR_PAGE=1 omlaag.
const MIN_PROVIDERS_FOR_PAGE = Number(process.env.MIN_PROVIDERS_FOR_PAGE) || 2;
const MIN_SHARED_DESTINATIONS = 3;

function readJson(rel, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(/*turbopackIgnore: true*/ process.cwd(), rel), "utf8"));
  } catch {
    return fallback;
  }
}

let _plans = null;
function dataset() {
  if (!_plans) _plans = readJson("data/plans.json", { generated_at: null, items: [] });
  return _plans;
}

let _facts = null;
export function getFacts() {
  if (!_facts) _facts = readJson("data/providers-facts.json", { providers: {} }).providers || {};
  return _facts;
}

export function getDatasetMeta() {
  const d = dataset();
  return { generatedAt: d.generated_at || null, items: (d.items || []).length };
}

function mostCommon(list) {
  const counts = new Map();
  for (const v of list) counts.set(v, (counts.get(v) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

function toRows(item) {
  const rows = [];
  for (const p of item.plans || []) {
    const price = Number(p.price);
    const validity = Number(p.validity_days);
    const dataGb = p.data_gb == null ? null : Number(p.data_gb);
    const unlimited = !!p.unlimited;
    if (!(price > 0) || !(validity > 0)) continue;
    if (!unlimited && !(dataGb > 0)) continue;
    rows.push({
      provider: item.provider,
      slug: item.slug,
      currency: item.currency,
      sourceUrl: destinationUrl(item.provider, item.slug) || item.source_url,
      fetchedAt: item.fetched_at,
      name: p.plan_name || null,
      network: p.network || null,
      dataGb,
      unlimited,
      days: validity,
      price,
      perGb: !unlimited ? price / dataGb : null,
      perDay: price / validity,
    });
  }
  return rows;
}

const _offers = new Map();

/** Alle vergelijkbare plannen voor een bestemming, gerangschikt op prijs per GB. */
export function getOffers(slug) {
  if (_offers.has(slug)) return _offers.get(slug);
  const items = (dataset().items || []).filter((i) => i.slug === slug);
  const all = items.flatMap(toRows);
  const cur = all.some((r) => r.currency === SITE.currency) ? SITE.currency : mostCommon(all.map((r) => r.currency));
  const rows = all.filter((r) => r.currency === cur);
  const excluded = [...new Set(all.filter((r) => r.currency !== cur).map((r) => r.provider))];
  const fixed = rows
    .filter((r) => !r.unlimited)
    .sort((a, b) => a.perGb - b.perGb || a.price - b.price);
  // Unlimited: op reisduur, daarbinnen de goedkoopste eerst. Rangschikken op prijs per dag zou
  // altijd een 60- of 90-daags plan bovenaan zetten, wat niemand helpt die 7 dagen reist.
  const unlimited = rows
    .filter((r) => r.unlimited)
    .sort((a, b) => a.days - b.days || a.price - b.price);
  const providers = [...new Set(rows.map((r) => r.provider))];
  // Oudste meting telt: een pagina is zo oud als haar oudste bron.
  const fetchedAt = items.map((i) => i.fetched_at).filter(Boolean).sort()[0] || null;
  const verdicts = {
    lowestPerGb: fixed.find((r) => r.dataGb >= 3) || fixed[0] || null,
    cheapest5gb: rows.filter((r) => !r.unlimited && r.dataGb >= 5 && r.days >= 7).sort((a, b) => a.price - b.price)[0] || null,
    cheapestUnlimited: unlimited.filter((r) => r.days >= 7).sort((a, b) => a.price - b.price)[0] || null,
  };
  const result = {
    slug,
    currency: cur || SITE.currency,
    rows,
    fixed,
    unlimited,
    providers,
    excluded,
    fetchedAt,
    verdicts,
    hasPage: providers.length >= MIN_PROVIDERS_FOR_PAGE,
  };
  _offers.set(slug, result);
  return result;
}

/** Beste (laagste per GB) vast plan van een provider in een bestemming. */
export function bestFixed(offers, provider) {
  return offers.fixed.find((r) => r.provider === provider) || null;
}

/**
 * Prijs-per-GB-spreiding per bestemming: goedkoopste vs duurste provider (elk op zijn eigen
 * laagste prijs/GB). Alleen bestemmingen met >=2 providers en echte data. Gesorteerd op ratio.
 * Geen verzonnen cijfers: alles uit data/plans.json via getOffers (single-currency, vaste plannen).
 */
export function getPriceSpread(limit = 12) {
  const rows = [];
  for (const d of DESTINATIONS) {
    const o = getOffers(d.slug);
    if (!o.hasPage) continue;
    const minByProvider = new Map();
    for (const r of o.fixed) {
      if (!(r.perGb > 0)) continue;
      if (!minByProvider.has(r.provider) || r.perGb < minByProvider.get(r.provider)) minByProvider.set(r.provider, r.perGb);
    }
    if (minByProvider.size < 2) continue;
    const arr = [...minByProvider.entries()].map(([provider, perGb]) => ({ provider, perGb })).sort((a, b) => a.perGb - b.perGb);
    const lo = arr[0], hi = arr[arr.length - 1];
    rows.push({ slug: d.slug, name: d.name, currency: o.currency, lo, hi, ratio: hi.perGb / lo.perGb, providers: arr.length });
  }
  rows.sort((a, b) => b.ratio - a.ratio);
  return limit ? rows.slice(0, limit) : rows;
}

/** Homepage: bestemmingen op zoekvolume, met de laagste prijs per GB als er data is. */
export function getPopular(limit = 12) {
  return [...DESTINATIONS]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit)
    .map((d) => {
      const o = getOffers(d.slug);
      return { ...d, hasPage: o.hasPage, from: o.hasPage ? o.verdicts.lowestPerGb : null, currency: o.currency };
    });
}

/** Het 7-daagse onbeperkte plan van een provider (de gangbare reisduur, vergelijkbaar over providers). */
function unlimited7(offers, provider) {
  return offers.unlimited.find((r) => r.provider === provider && r.days === 7) || null;
}

const MODES = {
  // Beide verkopen vaste GB-plannen: vergelijk de laagste prijs per GB.
  perGb: { pick: bestFixed, value: (r) => r.perGb },
  // Eén van beide verkoopt alleen onbeperkt (bv. Holafly): vergelijk de prijs van het 7-daagse plan.
  unlimited7: { pick: unlimited7, value: (r) => r.price },
};

/**
 * Vergelijking A vs B. Eerst per GB (beide hebben vaste plannen), anders op de prijs van het
 * 7-daagse onbeperkte plan. `mode` zegt welke gebruikt is, zodat de pagina eerlijk kan benoemen
 * wat er vergeleken wordt.
 */
export function getComparison(a, b) {
  for (const [mode, { pick, value }] of Object.entries(MODES)) {
    const shared = [];
    for (const d of DESTINATIONS) {
      const o = getOffers(d.slug);
      const ra = pick(o, a);
      const rb = pick(o, b);
      if (ra && rb) {
        const va = value(ra);
        const vb = value(rb);
        shared.push({ destination: d, a: ra, b: rb, winner: va === vb ? null : va < vb ? a : b, currency: o.currency });
      }
    }
    if (shared.length >= MIN_SHARED_DESTINATIONS) {
      const wins = { [a]: 0, [b]: 0 };
      for (const s of shared) if (s.winner) wins[s.winner] += 1;
      const dates = shared.flatMap((s) => [s.a.fetchedAt, s.b.fetchedAt]).filter(Boolean).sort();
      return { a, b, mode, shared, wins, fetchedAt: dates[0] || null, hasPage: true };
    }
  }
  return { a, b, mode: "perGb", shared: [], wins: { [a]: 0, [b]: 0 }, fetchedAt: null, hasPage: false };
}

export function validPairs() {
  return PAIRS.filter(([a, b]) => getComparison(a, b).hasPage);
}

/** Alternatieven voor een provider: andere providers die genoeg bestemmingen delen. */
export function getAlternatives(provider) {
  const list = [];
  for (const other of PROVIDER_SLUGS) {
    if (other === provider) continue;
    const c = getComparison(provider, other);
    if (c.hasPage) list.push({ provider: other, comparison: c });
  }
  list.sort((x, y) => y.comparison.shared.length - x.comparison.shared.length);
  return list;
}

export function providersWithAlternatives() {
  return PROVIDER_SLUGS.filter((p) => getAlternatives(p).length >= 1);
}

/** Providers die in minstens één gepubliceerde bestemming geverifieerde prijzen hebben. */
export function providersWithData() {
  const set = new Set();
  for (const d of DESTINATIONS) {
    const o = getOffers(d.slug);
    if (o.hasPage) o.providers.forEach((p) => set.add(p));
  }
  return PROVIDER_SLUGS.filter((p) => set.has(p));
}

/** Overzicht van één provider over alle bestemmingen: dekking, goedkoopste per GB, prijsbereik. */
export function getProviderOverview(provider) {
  const rows = [];
  let hasFixed = false;
  let hasUnlimited = false;
  let cheapestUnlimited7 = null;
  for (const d of DESTINATIONS) {
    const o = getOffers(d.slug);
    if (!o.hasPage) continue;
    const mine = o.rows.filter((r) => r.provider === provider);
    if (!mine.length) continue;
    const fixed = mine.filter((r) => !r.unlimited).sort((a, b) => a.perGb - b.perGb);
    const unl = mine.filter((r) => r.unlimited);
    if (fixed.length) hasFixed = true;
    if (unl.length) hasUnlimited = true;
    const u7 = unl.filter((r) => r.days === 7).sort((a, b) => a.price - b.price)[0];
    if (u7 && (!cheapestUnlimited7 || u7.price < cheapestUnlimited7.price)) {
      cheapestUnlimited7 = { ...u7, destination: d.name, slug: d.slug };
    }
    rows.push({
      slug: d.slug,
      name: d.name,
      type: d.type,
      currency: o.currency,
      fetchedAt: o.fetchedAt,
      bestPerGb: fixed[0] ? fixed[0].perGb : null,
      cheapestPrice: Math.min(...mine.map((r) => r.price)),
    });
  }
  const withPerGb = rows.filter((r) => r.bestPerGb != null).sort((a, b) => a.bestPerGb - b.bestPerGb);
  const dates = rows.map((r) => r.fetchedAt).filter(Boolean).sort();
  rows.sort((a, b) => (a.bestPerGb ?? Infinity) - (b.bestPerGb ?? Infinity) || a.cheapestPrice - b.cheapestPrice);
  return {
    provider,
    destinations: rows.length,
    rows,
    lowestPerGb: withPerGb[0] || null,
    cheapestUnlimited7,
    hasFixed,
    hasUnlimited,
    currency: rows[0]?.currency || SITE.currency,
    fetchedAt: dates[0] || null,
  };
}
