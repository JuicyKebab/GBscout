// Saily plan scraper (Node 24, global fetch only). Saily = het eSIM-merk van het NordVPN-team.
//
// Bron: de landpagina https://saily.com/esim-<slug>/ is een Next.js App Router-pagina. De
// plan-catalogus zit in de RSC-flight (self.__next_f = geescapete JSON). Elk plan-object bevat:
//   balances:[{amount,is_unlimited,type:"DATA",unit:"GB"|"MB"}]  -> data (999GB+is_unlimited = unlimited)
//   duration:{amount,unit:"DAY"}                                  -> looptijd
//   amount_with_tax (cents, int)                                  -> prijs in de gekozen valuta
//   covered_countries:[ISO2,...]                                  -> dekking
//
// Alleen ECHTE land-plannen (covered_countries == [doelland]) worden overgenomen: Saily toont op
// een landpagina ook regionale/wereldwijde plannen, die niet vergelijkbaar zijn met een Japan-only
// plan. Plannen met bel-/sms-bundels (niet-DATA balances) worden overgeslagen (niet vergelijkbaar).
//
// Valuta: standaard geo (EUR in BE). Cookie `currency=USD` dwingt USD af (geverifieerd: alle
// Offer-prijzen worden dan USD). robots.txt laat de landpagina's toe.
//
// Netwerk: Cloudflare blokkeert Node's undici op TLS-fingerprint (403), ook met volledige
// browserheaders. curl komt er wel door, dus we halen de HTML via curl op (aanwezig op Windows
// 10+, Linux CI en macOS). De parsing blijft in Node.
//
//   node scripts/providers/saily.mjs japan [italy ...]
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);

const SITE = 'https://saily.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const MIN_INTERVAL_MS = 1500;

// Onze slug -> ISO2 (covered_countries gebruikt ISO2). Regio's (europe/asia/global) staan er NIET in:
// Saily-regioplannen zijn niet vergelijkbaar met de landgebaseerde ranking, dus die bestemmingen
// krijgen gewoon geen Saily-bron.
const ISO2 = {
  'united-states': 'US', japan: 'JP', 'united-kingdom': 'GB', italy: 'IT', china: 'CN', canada: 'CA',
  mexico: 'MX', france: 'FR', thailand: 'TH', spain: 'ES', philippines: 'PH', india: 'IN', australia: 'AU',
  vietnam: 'VN', turkey: 'TR', 'costa-rica': 'CR', portugal: 'PT', ireland: 'IE', 'south-korea': 'KR',
  germany: 'DE', greece: 'GR', indonesia: 'ID', singapore: 'SG', taiwan: 'TW', 'new-zealand': 'NZ',
  iceland: 'IS', colombia: 'CO', brazil: 'BR', peru: 'PE', 'hong-kong': 'HK', switzerland: 'CH', morocco: 'MA',
  'dominican-republic': 'DO', egypt: 'EG', 'south-africa': 'ZA', israel: 'IL', uae: 'AE', jamaica: 'JM',
  panama: 'PA', norway: 'NO', sweden: 'SE', 'saudi-arabia': 'SA', croatia: 'HR', chile: 'CL', ecuador: 'EC',
  cuba: 'CU', albania: 'AL', kenya: 'KE', pakistan: 'PK', malaysia: 'MY', denmark: 'DK', cambodia: 'KH',
  lebanon: 'LB', tanzania: 'TZ', jordan: 'JO', austria: 'AT', tunisia: 'TN', bahamas: 'BS', laos: 'LA',
  'sri-lanka': 'LK', romania: 'RO', fiji: 'FJ', hungary: 'HU', russia: 'RU', 'puerto-rico': 'PR',
  uzbekistan: 'UZ', argentina: 'AR', georgia: 'GE', maldives: 'MV', bolivia: 'BO', cyprus: 'CY',
  poland: 'PL', qatar: 'QA', netherlands: 'NL',
};

// Enkele slugs wijken af van Saily's land-slug in de URL.
const PAGE_SLUG = { uae: 'united-arab-emirates' };

let lastRequest = 0;
// Haalt de pagina via curl op. Geeft { status, body } terug (body leeg bij non-200).
async function politeFetch(url) {
  const wait = lastRequest + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  const MARK = '\n__HTTP_STATUS__:';
  const args = [
    '-sS', '--compressed', '--max-time', '45',
    '-A', UA,
    '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    '-H', 'Accept-Language: en-US,en;q=0.9',
    '-b', 'currency=USD',
    '-w', MARK + '%{http_code}',
    url,
  ];
  const { stdout } = await execFileP('curl', args, { maxBuffer: 32 * 1024 * 1024 });
  const i = stdout.lastIndexOf(MARK);
  if (i < 0) return { status: 0, body: stdout };
  return { status: Number(stdout.slice(i + MARK.length).trim()), body: stdout.slice(0, i) };
}

// Pak het omsluitende { } object rond positie `idx` in string `s`.
function enclosingObject(s, idx) {
  let depth = 0;
  let start = -1;
  for (let i = idx; i >= 0; i--) {
    const c = s[i];
    if (c === '}') depth++;
    else if (c === '{') {
      if (depth === 0) { start = i; break; }
      depth--;
    }
  }
  if (start < 0) return null;
  depth = 0;
  for (let j = start; j < s.length; j++) {
    const c = s[j];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return s.slice(start, j + 1);
    }
  }
  return null;
}

function parsePlans(html, iso2) {
  // De flight-JSON staat met geescapete quotes in de HTML; één keer un-escapen volstaat.
  const u = html.replaceAll('\\"', '"');
  const seen = new Set();
  const plans = [];
  const re = /"duration":\{"amount"/g;
  let m;
  while ((m = re.exec(u))) {
    const obj = enclosingObject(u, m.index);
    if (!obj || seen.has(obj)) continue;
    seen.add(obj);

    const cc = obj.match(/"covered_countries":\[([^\]]*)\]/);
    if (!cc) continue;
    const countries = cc[1].match(/[A-Z]{2}/g) || [];
    // Alleen echte land-plannen: dekking is precies het doelland.
    if (countries.length !== 1 || countries[0] !== iso2) continue;

    const balances = [...obj.matchAll(/\{"amount":(\d+),"is_unlimited":(true|false),"type":"(\w+)","unit":"(\w+)"\}/g)]
      .map((b) => ({ amount: Number(b[1]), unlimited: b[2] === 'true', type: b[3], unit: b[4] }));
    const data = balances.filter((b) => b.type === 'DATA');
    // Bundels met bel/sms zijn niet vergelijkbaar met alleen-data-plannen -> overslaan.
    if (balances.some((b) => b.type !== 'DATA') || data.length !== 1) continue;

    const dur = obj.match(/"duration":\{"amount":(\d+),"unit":"(\w+)"\}/);
    if (!dur || dur[2] !== 'DAY') continue;
    const days = Number(dur[1]);

    const cents = obj.match(/"amount_with_tax":(\d+)/);
    if (!cents) continue;
    const price = Number(cents[1]) / 100;
    if (!(price > 0) || !(days > 0)) continue;

    const d = data[0];
    const unlimited = d.unlimited === true;
    const gb = unlimited ? null : d.unit === 'MB' ? Math.round((d.amount / 1000) * 1000) / 1000 : d.amount;
    if (!unlimited && !(gb > 0)) continue;

    plans.push({ data_gb: gb, unlimited, validity_days: days, price, plan_name: null, network: null });
  }

  // Dedup op (unlimited, data, dagen): hou de goedkoopste (Saily toont basic + ultra varianten).
  const best = new Map();
  for (const p of plans) {
    const key = `${p.unlimited}|${p.data_gb}|${p.validity_days}`;
    const cur = best.get(key);
    if (!cur || p.price < cur.price) best.set(key, p);
  }
  return [...best.values()];
}

export async function fetchPlans(slug) {
  const iso2 = ISO2[slug];
  if (!iso2) throw new Error(`Saily: no ISO2 for slug "${slug}" (regions unsupported)`);
  const pageSlug = PAGE_SLUG[slug] || slug;
  const url = `${SITE}/esim-${pageSlug}/`;

  const res = await politeFetch(url);
  if (res.status === 404) throw new Error(`Saily: no page for "${slug}" (HTTP 404 at ${url})`);
  if (res.status !== 200) throw new Error(`Saily HTTP ${res.status} for ${url}`);
  const html = res.body;
  if (!html.includes('currency')) throw new Error('Saily: unexpected page (no catalogue; markup changed or bot challenge)');

  const plans = parsePlans(html, iso2);
  if (!plans.length) throw new Error(`Saily: no single-country USD plans parsed for "${slug}"`);
  plans.sort((x, y) => (x.unlimited - y.unlimited) || ((x.data_gb ?? 0) - (y.data_gb ?? 0)) || x.validity_days - y.validity_days);

  return { provider: 'saily', slug, source_url: url, fetched_at: new Date().toISOString(), currency: 'USD', plans };
}

// CLI: node saily.mjs japan [italy ...]
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!slugs.length) {
    console.error('usage: node saily.mjs <slug> [slug...]');
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
