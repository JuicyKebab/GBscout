// Airalo plan scraper (Node 24, global fetch only).
//
// Source: the same public JSON API that airalo.com's own Nuxt frontend calls:
//   GET https://www.airalo.com/api/v4/countries/{slug}   (countries)
//   GET https://www.airalo.com/api/v4/regions/{slug}     (regions; "global" = region "world")
// No auth needed. Critical headers (verified):
//   x-client-version: version2   -> FULL catalog (e.g. Japan 17 plans). Without it the API
//                                   returns a legacy subset (Japan 7 plans, different tiers).
//   Accept-Currency: USD         -> prices in USD (otherwise geo/IP default, e.g. EUR in BE).
//   Accept-Language: en
// Fallback: if the API fails, parse the SSR payload (<script id="__NUXT_DATA__">, devalue format)
// of https://www.airalo.com/{slug}-esim. That path serves the currency of the viewer's geo (EUR in BE).

import { pathToFileURL } from 'node:url';

const API = 'https://www.airalo.com/api/v4';
const SITE = 'https://www.airalo.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const MIN_INTERVAL_MS = 1500; // polite delay between requests (applies across calls in one process)

// our slug -> { kind, api (API slug), page (site path) }
const country = (s) => ({ kind: 'countries', api: s, page: `/${s}-esim` });
const SLUGS = {
  europe: { kind: 'regions', api: 'europe', page: '/europe-esim' },
  asia: { kind: 'regions', api: 'asia', page: '/asia-esim' },
  global: { kind: 'regions', api: 'world', page: '/global-esim' },
  ...Object.fromEntries(
    [
      'japan', 'united-states', 'united-kingdom', 'italy', 'china', 'canada', 'mexico', 'france',
      'thailand', 'spain', 'philippines', 'india', 'australia', 'vietnam', 'turkey', 'costa-rica',
      'portugal', 'ireland', 'germany', 'greece', 'south-korea', 'indonesia', 'singapore',
    ].map((s) => [s, country(s)]),
  ),
  // Onze slug wijkt af van Airalo's land-slug:
  uae: { kind: 'countries', api: 'united-arab-emirates', page: '/united-arab-emirates-esim' },
};

let lastRequest = 0;
async function politeFetch(url, init) {
  const wait = lastRequest + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  return fetch(url, { ...init, signal: AbortSignal.timeout(30_000) });
}

// Resolve Nuxt's devalue-style payload (flat array, numeric references).
function resolveNuxtData(html) {
  const m = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('__NUXT_DATA__ script not found');
  const arr = JSON.parse(m[1]);
  const memo = new Map();
  const wrappers = new Set(['Reactive', 'ShallowReactive', 'Ref', 'ShallowRef', 'EmptyRef', 'EmptyShallowRef']);
  const R = (i) => {
    const v = arr[i];
    if (v === null || typeof v !== 'object') return v;
    if (memo.has(i)) return memo.get(i);
    if (Array.isArray(v)) {
      if (typeof v[0] === 'string' && wrappers.has(v[0])) return R(v[1]);
      const out = [];
      memo.set(i, out);
      for (const x of v) out.push(R(x));
      return out;
    }
    const out = {};
    memo.set(i, out);
    for (const k of Object.keys(v)) out[k] = R(v[k]);
    return out;
  };
  return R(0);
}

async function fromApi(def, currency) {
  const url = `${API}/${def.kind}/${def.api}`;
  const res = await politeFetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'application/json',
      'Accept-Language': 'en',
      'Accept-Currency': currency,
      'x-client-version': 'version2',
    },
  });
  if (res.status === 404) {
    const e = new Error(`Airalo has no ${def.kind.slice(0, -1)} "${def.api}" (HTTP 404 at ${url})`);
    e.notFound = true;
    throw e;
  }
  if (!res.ok) throw new Error(`Airalo API HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fromHtml(def) {
  const res = await politeFetch(SITE + def.page, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error(`Airalo page HTTP ${res.status} for ${SITE + def.page}`);
  const root = resolveNuxtData(await res.text());
  const queries = root?.state?.['$svue-query']?.queries ?? [];
  const q = queries.find(
    (x) => ['country', 'region'].includes(x.queryKey?.[0]) && x.queryKey.includes(def.api) && x.state?.data?.packages,
  );
  if (!q) throw new Error('package query not found in SSR payload');
  return q.state.data;
}

function normalize(p) {
  const unlimited = p.is_unlimited === true;
  const mb = Number(p.amount);
  const price = Number(p.price?.amount);
  const days = Number(p.day);
  if (!Number.isFinite(price) || !Number.isFinite(days)) throw new Error(`Unexpected package shape (id ${p.id})`);
  const nets = [...new Set((p.operator?.networks ?? []).filter((n) => n.status !== false).map((n) => n.network))];
  return {
    data_gb: unlimited || !Number.isFinite(mb) ? null : Math.round((mb / 1024) * 1000) / 1000,
    unlimited,
    validity_days: days,
    price,
    plan_name: p.operator?.title ? `${p.operator.title}: ${p.title}` : (p.title ?? null),
    network: nets.length ? nets.join(' / ') : null,
  };
}

export async function fetchPlans(slug, { currency = 'USD' } = {}) {
  // Bekende slug uit de map, anders aannemen dat het een land is met slug == Airalo-land-slug.
  // Bestaat het land niet bij Airalo, dan geeft de API 404 (notFound) en valt deze bron weg;
  // de pagina verschijnt alleen als >= 2 providers prijzen hebben (zie lib/data.js).
  const def = SLUGS[slug] || country(slug);

  let data;
  let source_url = `${API}/${def.kind}/${def.api}`;
  try {
    data = await fromApi(def, currency);
  } catch (e) {
    if (e.notFound) throw e;
    source_url = SITE + def.page;
    try {
      data = await fromHtml(def);
    } catch (e2) {
      throw new Error(`Airalo fetch failed for "${slug}": API: ${e.message}; HTML fallback: ${e2.message}`);
    }
  }

  const pkgs = (data.packages ?? []).filter((p) => p.type === 'sim' && p.is_stock !== false);
  if (!pkgs.length) throw new Error(`Airalo returned no plans for "${slug}"`);
  const currencies = [...new Set(pkgs.map((p) => p.price?.currency?.code))];
  if (currencies.length !== 1) throw new Error(`Mixed/missing currencies for "${slug}": ${currencies}`);

  return {
    provider: 'airalo',
    slug,
    source_url,
    fetched_at: new Date().toISOString(),
    currency: currencies[0],
    plans: pkgs.map(normalize),
  };
}

// CLI: node airalo.mjs japan [italy europe ...]   (multiple slugs -> JSON array, throttled)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const cur = process.argv.find((a) => a.startsWith('--currency='))?.split('=')[1] ?? 'USD';
  if (!slugs.length) {
    console.error('usage: node airalo.mjs <slug> [slug...] [--currency=USD]');
    process.exit(2);
  }
  try {
    const out = [];
    for (const s of slugs) out.push(await fetchPlans(s, { currency: cur }));
    console.log(JSON.stringify(out.length === 1 ? out[0] : out, null, 2));
  } catch (e) {
    console.error(String(e.message ?? e));
    process.exit(1);
  }
}
