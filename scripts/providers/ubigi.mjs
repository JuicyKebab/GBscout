// Ubigi plan scraper (Node 24, global fetch only, no packages).
//
// Source: Ubigi's WooCommerce "eSIM data plans" page (server-rendered, no JS needed):
//   https://cellulardata.ubigi.com/data-plans-and-coverage/ubigi-esim-data-plans/?wmc-currency=USD
// (www.ubigi.com is only the marketing WordPress site; its /en/esim/<country> URLs do not exist.)
// That ONE page contains the whole catalogue (~1100 plan rows, all destinations, ~5.8 MB) as
//   <div class="plan row" datafld=".." data-label="JAPAN" data-countrylist="JPN"
//        data-type="one-off|monthly|annual" data-allowance="10" data-validity="30" data-price="16.5" ..>
// The destination filter on the page is client-side, so we fetch it once and filter by
// country list / region label here.
//
// Currency: `?wmc-currency=USD` (WooCommerce Multi Currency plugin) returns the real USD price list
// (Ubigi keeps separate fixed prices per currency, no live FX; USD and EUR happen to be numerically
// equal today). The default currency without the param/cookie is NOT guaranteed, so we always pass it
// and assert the displayed symbol is "US$".
//
// Only prepaid one-off plans are returned. Recurring "monthly" and "annual" subscriptions are skipped.
// "Unlimited" plans are fair-use plans (e.g. FUP30 = 30 GB full speed, then 2 Mbps; verified on the
// Japan 15-day plan page only).
// Network operators are on the plan detail page only; we read them for single-country destinations
// (one extra request) and leave network = null for multi-country regions or if parsing fails.

import { pathToFileURL } from 'node:url';

const BASE = 'https://cellulardata.ubigi.com';
const LIST_PATH = '/data-plans-and-coverage/ubigi-esim-data-plans/';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const MIN_INTERVAL_MS = 1500;

// generic slug -> how to select rows.  { countries: exact data-countrylist } or { label: data-label }
const SLUGS = {
  japan: { countries: 'JPN', iso: 'jpn' },
  'united-states': { countries: 'USA,PRI,VIR', iso: 'usa' }, // Ubigi's "USA" product also covers PR + USVI
  'united-kingdom': { countries: 'GBR', iso: 'gbr' }, // label is "UK"
  italy: { countries: 'ITA', iso: 'ita' },
  china: { countries: 'CHN', iso: 'chn' },
  canada: { countries: 'CAN', iso: 'can' },
  mexico: { countries: 'MEX', iso: 'mex' },
  france: { countries: 'FRA', iso: 'fra' },
  thailand: { countries: 'THA', iso: 'tha' },
  spain: { countries: 'ESP', iso: 'esp' },
  philippines: { countries: 'PHL', iso: 'phl' },
  india: { countries: 'IND', iso: 'ind' },
  australia: { countries: 'AUS', iso: 'aus' },
  vietnam: { countries: 'VNM', iso: 'vnm' },
  turkey: { countries: 'TUR', iso: 'tur' },
  'costa-rica': { countries: 'CRI', iso: 'cri' },
  portugal: { countries: 'PRT', iso: 'prt' },
  ireland: { countries: 'IRL', iso: 'irl' },
  germany: { countries: 'DEU', iso: 'deu' },
  greece: { countries: 'GRC', iso: 'grc' },
  'south-korea': { countries: 'KOR', iso: 'kor' },
  indonesia: { countries: 'IDN', iso: 'idn' },
  singapore: { countries: 'SGP', iso: 'sgp' },
  // Uitbreiding (okt 2026): landen waarvan de Ubigi-productgroep enkel het ISO3 is. Groepeert
  // Ubigi het land samen met andere (afwijkende data-countrylist), dan matcht de rij niet en valt
  // Ubigi weg voor die bestemming; de pagina blijft staan als >= 2 andere providers prijzen hebben.
  "taiwan": { countries: 'TWN', iso: 'twn' },
  "new-zealand": { countries: 'NZL', iso: 'nzl' },
  "iceland": { countries: 'ISL', iso: 'isl' },
  "colombia": { countries: 'COL', iso: 'col' },
  "brazil": { countries: 'BRA', iso: 'bra' },
  "peru": { countries: 'PER', iso: 'per' },
  "hong-kong": { countries: 'HKG', iso: 'hkg' },
  "switzerland": { countries: 'CHE', iso: 'che' },
  "morocco": { countries: 'MAR', iso: 'mar' },
  "dominican-republic": { countries: 'DOM', iso: 'dom' },
  "egypt": { countries: 'EGY', iso: 'egy' },
  "south-africa": { countries: 'ZAF', iso: 'zaf' },
  "israel": { countries: 'ISR', iso: 'isr' },
  "uae": { countries: 'ARE', iso: 'are' },
  "jamaica": { countries: 'JAM', iso: 'jam' },
  "panama": { countries: 'PAN', iso: 'pan' },
  "norway": { countries: 'NOR', iso: 'nor' },
  "sweden": { countries: 'SWE', iso: 'swe' },
  "saudi-arabia": { countries: 'SAU', iso: 'sau' },
  "croatia": { countries: 'HRV', iso: 'hrv' },
  "chile": { countries: 'CHL', iso: 'chl' },
  "ecuador": { countries: 'ECU', iso: 'ecu' },
  "cuba": { countries: 'CUB', iso: 'cub' },
  "albania": { countries: 'ALB', iso: 'alb' },
  "kenya": { countries: 'KEN', iso: 'ken' },
  "pakistan": { countries: 'PAK', iso: 'pak' },
  "malaysia": { countries: 'MYS', iso: 'mys' },
  "denmark": { countries: 'DNK', iso: 'dnk' },
  "cambodia": { countries: 'KHM', iso: 'khm' },
  "lebanon": { countries: 'LBN', iso: 'lbn' },
  "tanzania": { countries: 'TZA', iso: 'tza' },
  "jordan": { countries: 'JOR', iso: 'jor' },
  "austria": { countries: 'AUT', iso: 'aut' },
  "tunisia": { countries: 'TUN', iso: 'tun' },
  "bahamas": { countries: 'BHS', iso: 'bhs' },
  "laos": { countries: 'LAO', iso: 'lao' },
  "sri-lanka": { countries: 'LKA', iso: 'lka' },
  "romania": { countries: 'ROU', iso: 'rou' },
  "fiji": { countries: 'FJI', iso: 'fji' },
  "hungary": { countries: 'HUN', iso: 'hun' },
  "russia": { countries: 'RUS', iso: 'rus' },
  "puerto-rico": { countries: 'PRI', iso: 'pri' },
  "uzbekistan": { countries: 'UZB', iso: 'uzb' },
  "argentina": { countries: 'ARG', iso: 'arg' },
  "georgia": { countries: 'GEO', iso: 'geo' },
  "maldives": { countries: 'MDV', iso: 'mdv' },
  "bolivia": { countries: 'BOL', iso: 'bol' },
  "cyprus": { countries: 'CYP', iso: 'cyp' },
  "poland": { countries: 'POL', iso: 'pol' },
  "qatar": { countries: 'QAT', iso: 'qat' },
  "netherlands": { countries: 'NLD', iso: 'nld' },
  // regions: Ubigi sells "EUROPE" (38 countries incl. UK), "EUROPE EXTENDED" (55), "ASIA" (26),
  // "WORLD" and "BEST ..." variants. We map to the plain-named ones.
  europe: { label: 'EUROPE' },
  asia: { label: 'ASIA' },
  global: { label: 'WORLD' },
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
        signal: AbortSignal.timeout(60_000),
      });
      if (res.status >= 500 && attempt === 0) continue;
      return res;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error(`fetch failed: ${url}`);
}

// The catalogue page is ~5.8 MB: cache it for the lifetime of the process (5 min) so that looping over
// many slugs costs a single download.
let pageCache = null;
async function getCatalogue() {
  if (pageCache && Date.now() - pageCache.at < 300_000) return pageCache.html;
  const url = `${BASE}${LIST_PATH}?wmc-currency=USD`;
  const res = await politeFetch(url);
  if (!res.ok) throw new Error(`Ubigi catalogue HTTP ${res.status} for ${url}`);
  const html = await res.text();
  if (!html.includes('<div class="plan row"')) {
    throw new Error('Ubigi catalogue page has no plan rows (markup changed or bot challenge page served)');
  }
  pageCache = { at: Date.now(), html };
  return html;
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');

function parseRows(html) {
  const rows = [];
  const chunks = html.split('<div class="plan row"').slice(1);
  for (const chunk of chunks) {
    const tag = chunk.slice(0, chunk.indexOf('>'));
    const body = chunk.slice(chunk.indexOf('>'));
    const href = body.match(/<a href="([^"]+)"/)?.[1] ?? null;
    const allowance = body.match(/class="allowance">\s*<div>([^<]*)<\/div>/)?.[1]?.trim() ?? null;
    const tip = body.match(/class="tip">([^<]*)(?:<sup>([^<]*)<\/sup>)?/);
    rows.push({
      code: attr(tag, 'datafld'),
      label: decode(attr(tag, 'data-label') ?? ''),
      countries: attr(tag, 'data-countrylist') ?? '',
      type: attr(tag, 'data-type'),
      validity: Number(attr(tag, 'data-validity')),
      dataAttrPrice: Number(attr(tag, 'data-price')),
      allowance,
      href,
      tip: tip ? (tip[1] + (tip[2] ?? '')).trim() : null,
    });
  }
  return rows;
}

function parseAllowance(text) {
  if (!text) return null;
  if (/unlimited/i.test(text)) return { unlimited: true, gb: null };
  const m = text.match(/^([\d.]+)\s*(MB|GB|TB)$/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toUpperCase();
  const gb = unit === 'MB' ? n / 1000 : unit === 'TB' ? n * 1000 : n;
  return { unlimited: false, gb: Math.round(gb * 1000) / 1000 };
}

async function readNetworks(href) {
  try {
    const res = await politeFetch(href.includes('?') ? href : `${href}?wmc-currency=USD`);
    if (!res.ok) return null;
    const html = await res.text();
    const names = [
      ...html.matchAll(/<span>Network<em>\(s\)<\/em>:<\/span>\s*<div class="ff-open_sanslight">([^<]+)<\/div>/g),
    ].map((m) => decode(m[1]).trim());
    const uniq = [...new Set(names.filter(Boolean))];
    return uniq.length ? uniq.join(' / ') : null;
  } catch {
    return null;
  }
}

export async function fetchPlans(slug) {
  const def = SLUGS[slug];
  if (!def) throw new Error(`Ubigi: no destination for slug "${slug}". Supported: ${Object.keys(SLUGS).join(', ')}`);

  const html = await getCatalogue();
  const all = parseRows(html);
  const sel = all.filter(
    (r) => r.type === 'one-off' && (def.countries ? r.countries === def.countries : r.label === def.label),
  );
  if (!sel.length) throw new Error(`Ubigi: destination "${slug}" has no one-off plans on the catalogue page`);

  const seen = new Set();
  const plans = [];
  for (const r of sel) {
    if (seen.has(r.code)) continue;
    seen.add(r.code);
    if (!r.tip?.startsWith('US$')) {
      throw new Error(`Ubigi: expected USD ("US$") but plan ${r.code} shows "${r.tip}"`);
    }
    const shown = Number(r.tip.replace(/[^0-9.]/g, ''));
    if (!(r.dataAttrPrice > 0) || Math.abs(shown - r.dataAttrPrice) > 0.011) {
      throw new Error(`Ubigi: price mismatch for ${r.code}: data-price=${r.dataAttrPrice} vs shown "${r.tip}"`);
    }
    const a = parseAllowance(r.allowance);
    if (!a || !(r.validity > 0)) throw new Error(`Ubigi: unparseable plan row ${r.code} (allowance "${r.allowance}")`);
    const fup = r.code.match(/_FUP(\d+)$/)?.[1];
    plans.push({
      data_gb: a.gb,
      unlimited: a.unlimited,
      validity_days: r.validity,
      price: r.dataAttrPrice,
      plan_name: a.unlimited ? (fup ? `Unlimited (fair use ${fup}GB)` : 'Unlimited') : null,
      network: null,
      _href: r.href,
    });
  }

  // network: only for country destinations (regions span dozens of operators -> null)
  const network = def.countries && plans[0]._href ? await readNetworks(plans[0]._href) : null;

  plans.sort((x, y) => (x.unlimited - y.unlimited) || ((x.data_gb ?? 0) - (y.data_gb ?? 0)) || x.validity_days - y.validity_days);
  for (const p of plans) {
    p.network = network;
    delete p._href;
  }

  const sourceUrl = def.iso
    ? `${BASE}${LIST_PATH}?destination=${def.iso}&wmc-currency=USD`
    : `${BASE}${LIST_PATH}?wmc-currency=USD`;
  return {
    provider: 'ubigi',
    slug,
    source_url: sourceUrl,
    fetched_at: new Date().toISOString(),
    currency: 'USD',
    plans,
  };
}

// CLI: node ubigi.mjs japan [italy europe ...]   (multiple slugs -> JSON array)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!slugs.length) {
    console.error('usage: node ubigi.mjs <slug> [slug...]');
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
