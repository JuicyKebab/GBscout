// Jetpac plan scraper (Node 24, global fetch only, no packages).
//
// NOTE: jetpac.com is a parked easyDNS domain. The live site is https://www.jetpacglobal.com
//
// Source: the React Server Components payload that Next.js (app router) streams inline in every
// product page as `self.__next_f.push([1,"..."])` script chunks. It contains the exact plan list the page
// renders (verified identical to the browser-rendered text):
//   https://www.jetpacglobal.com/product-details/<pageName>       e.g. /product-details/japan-esim
//   product.fixedPlanSections[].plans[].durationOptions[]  -> fixed-GB plans  (price, listPrice, durationDays, dataInGB)
//   product.unlimitedPacks[].durationOptions[]              -> unlimited plans (dataInGB = -1)
//   product.supportedCountries[].operators[]                -> networks
// (The marketing-style URL https://www.jetpacglobal.com/esim-japan answers HTTP 200 but renders "Page not found".)
//
// Currency: the page serves USD by default (also from a Belgian IP); every option carries currencyCode and
// we assert it is USD. No cookie/param needed.
//
// CAVEAT (unresolved): Jetpac also exposes a public JSON catalogue API that the frontend bundle references:
//   GET https://orbit-api.circles.life/v1/labs/orbit/catalog/revamp/items?pageName=japan-esim&currency=USD
// It returns the SAME catalogIds but, for several fixed-GB plans, DIFFERENT prices than the page (e.g. Japan
// 10GB/30d: page 16 vs API 13.99; Europe 10GB/30d: page 22 vs API 19.99; Europe unlimited 3d: page 10.99
// vs API 12.99; Japan unlimited 3d/5d/7d: page 10.99/16.99/25.99 vs API 12.99/19.99/26.99). We use the page data because it is what the site visibly
// lists. Which one is charged at checkout was not verified (no purchase attempted).
// Plan "listPrice" (strike-through "was" price) is ignored; `price` is the current selling price.
// The `Jetpac Global` brand also sells a 1GB/4-day plan marked "Promocode / new users" in the API; the page
// lists it as a normal plan, so it is included.
// robots.txt allows everything. No bot wall seen (CloudFront, plain curl/fetch with a browser UA works).

import { pathToFileURL } from 'node:url';

const SITE = 'https://www.jetpacglobal.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const MIN_INTERVAL_MS = 1500;

const country = (s) => `${s}-esim`;
// Jetpac has no separate Singapore page (only inside southeast-asia-esim) -> singapore is rejected.
const SLUGS = {
  europe: 'european-union-esim',
  asia: 'asia-pacific-esim', // Jetpac also has southeast-asia-esim; "asia" maps to the wider Asia-Pacific pack
  global: 'global-esim',
  'united-states': 'united-states-of-america-esim',
  ...Object.fromEntries(
    [
      'japan', 'united-kingdom', 'italy', 'china', 'canada', 'mexico', 'france', 'thailand', 'spain',
      'philippines', 'india', 'australia', 'vietnam', 'turkey', 'costa-rica', 'portugal', 'ireland',
      'germany', 'greece', 'south-korea', 'indonesia',
    ].map((s) => [s, country(s)]),
  ),
};

let lastRequest = 0;
async function politeFetch(url) {
  const wait = lastRequest + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'en', Accept: 'text/html,*/*' },
        signal: AbortSignal.timeout(45_000),
      });
      if (res.status >= 500 && attempt === 0) continue;
      return res;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error(`fetch failed: ${url}`);
}

// Concatenate the RSC string chunks: self.__next_f.push([1,"<json string>"])
function rscText(html) {
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let out = '';
  for (const m of html.matchAll(re)) out += JSON.parse(`"${m[1]}"`);
  return out;
}

// From `start` (pointing at '[' or '{') return the balanced JSON text, string-aware.
function balanced(s, start) {
  const open = s[start];
  const close = open === '[' ? ']' : '}';
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) return s.slice(start, i + 1);
  }
  throw new Error('unbalanced JSON in RSC payload');
}

function jsonAfter(text, key) {
  const k = `"${key}":`;
  let i = text.indexOf(k);
  while (i >= 0) {
    const c = text[i + k.length];
    if (c === '[' || c === '{') return JSON.parse(balanced(text, i + k.length));
    i = text.indexOf(k, i + 1); // skip i18n string occurrences such as "unlimitedPacks":"Unlimited packs"
  }
  return null;
}

export async function fetchPlans(slug) {
  const pageName = SLUGS[slug];
  if (!pageName) {
    throw new Error(
      `Jetpac: no destination for slug "${slug}"` +
        (slug === 'singapore' ? ' (Jetpac has no Singapore page, only southeast-asia-esim)' : '') +
        `. Supported: ${Object.keys(SLUGS).join(', ')}`,
    );
  }
  const url = `${SITE}/product-details/${pageName}`;
  const res = await politeFetch(url);
  if (res.status === 404) throw new Error(`Jetpac: destination "${slug}" does not exist (HTTP 404 at ${url})`);
  if (!res.ok) throw new Error(`Jetpac HTTP ${res.status} for ${url}`);
  const text = rscText(await res.text());

  const fixed = jsonAfter(text, 'fixedPlanSections') ?? [];
  const unlimited = jsonAfter(text, 'unlimitedPacks') ?? [];
  const supported = jsonAfter(text, 'supportedCountries') ?? [];
  if (!fixed.length && !unlimited.length) {
    throw new Error(`Jetpac: no plan data in page payload for "${slug}" (markup changed or "Page not found")`);
  }

  const options = [];
  for (const sec of fixed) for (const p of sec.plans ?? []) for (const o of p.durationOptions ?? []) options.push({ o, name: p.packName });
  for (const pack of unlimited) for (const o of pack.durationOptions ?? []) options.push({ o, name: pack.packName ?? 'Unlimited' });

  const ops =
    supported.length === 1
      ? [...new Set((supported[0].operators ?? []).map((x) => x.operatorName).filter(Boolean))]
      : [];
  const network = ops.length ? ops.join(' / ') : null;

  const seen = new Set();
  const plans = [];
  for (const { o, name } of options) {
    if (seen.has(o.catalogId)) continue;
    seen.add(o.catalogId);
    if (o.currencyCode !== 'USD') throw new Error(`Jetpac: expected USD but got ${o.currencyCode} for ${o.catalogId}`);
    const isUnl = o.dataInGB === -1;
    const price = Number(o.price);
    const days = Number(o.durationDays);
    if (!(price > 0) || !(days > 0) || (!isUnl && !(Number(o.dataInGB) > 0))) {
      throw new Error(`Jetpac: unexpected plan shape ${JSON.stringify(o).slice(0, 200)}`);
    }
    plans.push({
      data_gb: isUnl ? null : Number(o.dataInGB),
      unlimited: isUnl,
      validity_days: days,
      price,
      plan_name: name ?? null,
      network,
    });
  }
  plans.sort((x, y) => (x.unlimited - y.unlimited) || ((x.data_gb ?? 0) - (y.data_gb ?? 0)) || x.validity_days - y.validity_days);

  return { provider: 'jetpac', slug, source_url: url, fetched_at: new Date().toISOString(), currency: 'USD', plans };
}

// CLI: node jetpac.mjs japan [italy europe ...]   (multiple slugs -> JSON array)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!slugs.length) {
    console.error('usage: node jetpac.mjs <slug> [slug...]');
    process.exit(2);
  }
  try {
    const out = [];
    for (const s of slugs) out.push(await fetchPlans(s));
    console.log(JSON.stringify(out.length === 1 ? out[0] : out, null, 2));
  } catch (e) {
    console.error(String(e.message ?? e));
    process.exit(1);
  }
}
