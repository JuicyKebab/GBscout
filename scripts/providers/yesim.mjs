// Yesim plan scraper (Node 24, global fetch only, no packages).
//
// Source: <script id="__NEXT_DATA__"> (Next.js pages router, getServerSideProps) of the public country /
// region pages. pageProps.standardPlans[] (fixed-GB plans) and pageProps.unlimitedPlans[] (day-based
// unlimited plans) hold every plan; the same numbers are rendered in the visible HTML.
//   countries: https://yesim.app/country/<slug>/          e.g. /country/japan/
//   regions:   https://yesim.app/regions/europe-esim/  /regions/asia-esim/
//   global:    https://yesim.app/global/global-package-esim/
// (https://yesim.app/esim/japan/ is a 404.)
//
// Currency: the page currency comes from the `currency` cookie (the server otherwise geo-guesses from the
// IP: EUR in Belgium). We send `Cookie: currency=USD` (NOT a ?query, robots.txt disallows /*?*).
// Prices in the payload are EUR cents (`vanillaPrice`); pageProps.currency.rate converts to the served
// currency (USD rate 1.2 at time of writing) -> price = vanillaPrice * rate / 100. This reproduces the
// visible "$xx.xx" labels exactly (checked on Japan, Europe, USA). So USD is a Yesim-side conversion
// from a EUR base price, not a separate USD price list.
//
// Skipped: plans flagged `free: true` (first-time-user free/trial plan, not a normal purchase).
// robots.txt: only /*/marketplace/, /*/preload/, /undefined/, /null/ and query strings are disallowed;
// country/region pages are allowed.

import { pathToFileURL } from 'node:url';

const SITE = 'https://yesim.app';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const MIN_INTERVAL_MS = 1500;

const country = (s) => `/country/${s}/`;
const SLUGS = {
  europe: '/regions/europe-esim/', // "Europe & UK", 33 destinations
  asia: '/regions/asia-esim/',
  global: '/global/global-package-esim/',
  ...Object.fromEntries(
    [
      'japan', 'united-states', 'united-kingdom', 'italy', 'china', 'canada', 'mexico', 'france',
      'thailand', 'spain', 'philippines', 'india', 'australia', 'vietnam', 'turkey', 'costa-rica',
      'portugal', 'ireland', 'germany', 'greece', 'south-korea', 'indonesia', 'singapore',
    ].map((s) => [s, country(s)]),
  ),
};

let lastRequest = 0;
async function politeFetch(url, init) {
  const wait = lastRequest + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(45_000) });
      if (res.status >= 500 && attempt === 0) continue;
      return res;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error(`fetch failed: ${url}`);
}

function extractNextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ script not found (markup changed or bot challenge page served)');
  return JSON.parse(m[1]);
}

function normalize(p, rate) {
  const unlimited = p.unlimited === true;
  const days = Number(p.validityPeriod);
  const base = Number(p.vanillaPrice);
  if (!(days > 0) || !(base > 0)) throw new Error(`Unexpected plan shape (id ${p.id})`);
  let gb = null;
  if (!unlimited) {
    const amount = Number(p.dataAmount?.amount);
    const unit = String(p.dataAmount?.unit ?? '').toUpperCase();
    if (!(amount > 0)) throw new Error(`Unexpected data amount on plan ${p.id}`);
    gb = unit === 'MB' ? amount / 1000 : unit === 'TB' ? amount * 1000 : amount;
    gb = Math.round(gb * 1000) / 1000;
  }
  const dests = p.destinations ?? [];
  const ops = dests.length === 1 ? [...new Set((dests[0].operators ?? []).map((o) => o.name).filter(Boolean))] : [];
  return {
    data_gb: gb,
    unlimited,
    validity_days: days,
    price: Math.round(base * rate) / 100,
    plan_name: null,
    network: ops.length ? ops.join(' / ') : null,
  };
}

export async function fetchPlans(slug, { currency = 'USD' } = {}) {
  // Bekend pad, anders aannemen /country/<slug>/. Bestaat het niet, dan 404 -> bron valt weg
  // (pagina verschijnt alleen bij >= 2 providers met prijzen, zie lib/data.js).
  const path = SLUGS[slug] || country(slug);
  const url = SITE + path;

  const res = await politeFetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en', Accept: 'text/html,*/*', Cookie: `currency=${currency}` },
  });
  if (res.status === 404) throw new Error(`Yesim: destination "${slug}" does not exist (HTTP 404 at ${url})`);
  if (!res.ok) throw new Error(`Yesim HTTP ${res.status} for ${url}`);
  const data = extractNextData(await res.text());
  const pp = data?.props?.pageProps;
  if (!pp || (!pp.standardPlans && !pp.unlimitedPlans)) {
    throw new Error(`Yesim: no plan lists in page props for "${slug}" (page type ${data?.page})`);
  }

  const cur = pp.currency;
  const rate = Number(cur?.rate);
  if (cur?.code !== currency || !(rate > 0)) {
    throw new Error(`Yesim: wanted ${currency} but page served ${cur?.code} (rate ${cur?.rate})`);
  }

  const seen = new Set();
  const plans = [];
  for (const p of [...(pp.standardPlans ?? []), ...(pp.unlimitedPlans ?? [])]) {
    if (p.free === true || seen.has(p.id)) continue;
    seen.add(p.id);
    plans.push(normalize(p, rate));
  }
  if (!plans.length) throw new Error(`Yesim returned no plans for "${slug}"`);
  plans.sort((x, y) => (x.unlimited - y.unlimited) || ((x.data_gb ?? 0) - (y.data_gb ?? 0)) || x.validity_days - y.validity_days);

  return { provider: 'yesim', slug, source_url: url, fetched_at: new Date().toISOString(), currency: cur.code, plans };
}

// CLI: node yesim.mjs japan [italy europe ...]   (multiple slugs -> JSON array)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!slugs.length) {
    console.error('usage: node yesim.mjs <slug> [slug...]');
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
