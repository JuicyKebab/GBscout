// Holafly: unlimited-plannen per aantal dagen, in USD.
//
// Bron: de landpagina https://esim.holafly.com/esim-<land>/ is een Astro-site. De component
// "ProductPricing" krijgt alle varianten (1 tot 90 dagen, alle valuta's) als geserialiseerde
// props mee in <astro-island props="...">. Dat is HTML die de site zelf serveert; robots.txt
// laat de pagina's toe (en staat ?currency= expliciet toe).
//
// Holafly verkoopt per land alleen "unlimited" (met een dagelijks snelheidslimiet, zie
// data/providers-facts.json). Er is dus nooit een vast aantal GB.
//
//   node scripts/providers/holafly.mjs japan
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const BASE = "https://esim.holafly.com";
const CURRENCY = "USD";

// Een vaste set veelgebruikte duren. De site laat elk aantal dagen van 1 tot 90 toe; een tabel
// met 90 rijen per bestemming helpt niemand.
const DAYS = [1, 3, 5, 7, 10, 14, 15, 20, 30, 60, 90];

const PATHS = {
  "united-states": ["esim-usa", "esim-united-states"],
  japan: ["esim-japan"],
  europe: ["esim-europe"],
  "united-kingdom": ["esim-united-kingdom", "esim-uk"],
  italy: ["esim-italy"],
  china: ["esim-china"],
  canada: ["esim-canada"],
  mexico: ["esim-mexico"],
  france: ["esim-france"],
  thailand: ["esim-thailand"],
  spain: ["esim-spain"],
  philippines: ["esim-philippines"],
  india: ["esim-india"],
  australia: ["esim-australia"],
  vietnam: ["esim-vietnam"],
  turkey: ["esim-turkey"],
  "costa-rica": ["esim-costa-rica"],
  asia: ["esim-asia"],
  portugal: ["esim-portugal"],
  ireland: ["esim-ireland"],
  "south-korea": ["esim-south-korea"],
  germany: ["esim-germany"],
  greece: ["esim-greece"],
  indonesia: ["esim-indonesia"],
  singapore: ["esim-singapore"],
  global: ["esim-global", "esim-worldwide"],
};

const unescapeHtml = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// Astro serialiseert props als tuples: [0, waarde] (primitief of object met tuples) en [1, [...]] (array).
function revive(v) {
  if (!Array.isArray(v) || v.length !== 2 || typeof v[0] !== "number") return v;
  const [type, val] = v;
  if (type === 0) {
    return val && typeof val === "object" && !Array.isArray(val)
      ? Object.fromEntries(Object.entries(val).map(([k, x]) => [k, revive(x)]))
      : val;
  }
  if (type === 1) return val.map(revive);
  return val;
}

function islandProps(html, componentName) {
  for (const m of html.matchAll(/<astro-island\s([^>]*)>/g)) {
    const attrs = m[1];
    const component = (attrs.match(/component-url="([^"]*)"/) || [])[1] || "";
    if (!component.includes(componentName)) continue;
    const raw = (attrs.match(/props="([^"]*)"/) || [])[1];
    if (!raw) continue;
    return Object.fromEntries(Object.entries(JSON.parse(unescapeHtml(raw))).map(([k, x]) => [k, revive(x)]));
  }
  return null;
}

async function fetchPage(path) {
  const url = `${BASE}/${path}/`;
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8", "accept-language": "en" },
    redirect: "follow",
  });
  if (!res.ok) return { url, status: res.status, html: null };
  return { url, status: res.status, html: await res.text() };
}

export async function fetchPlans(slug) {
  // Bekend pad, anders aannemen esim-<slug>. Bestaat de pagina niet, dan 404 -> bron valt weg
  // (pagina verschijnt alleen bij >= 2 providers met prijzen, zie lib/data.js).
  const paths = PATHS[slug] || [`esim-${slug}`];

  let lastStatus = null;
  for (const path of paths) {
    const { url, status, html } = await fetchPage(path);
    lastStatus = status;
    if (!html) continue;
    const props = islandProps(html, "ProductPricing");
    if (!props || !Array.isArray(props.variants) || !props.variants.length) continue;

    const plans = [];
    for (const v of props.variants) {
      if (!DAYS.includes(Number(v.days))) continue;
      if (String(v.gigas).toLowerCase() !== "unlimited") continue; // enkel unlimited; vaste GB zou een ander product zijn
      const price = Number(v.currencies?.[CURRENCY]);
      if (!(price > 0)) continue;
      plans.push({ data_gb: null, unlimited: true, validity_days: Number(v.days), price, plan_name: null, network: null });
    }
    if (!plans.length) throw new Error(`holafly ${slug}: no ${CURRENCY} unlimited plans parsed from ${url}`);
    return { provider: "holafly", slug, source_url: url, fetched_at: new Date().toISOString(), currency: CURRENCY, plans };
  }
  throw new Error(`Holafly has no page for "${slug}" (last status ${lastStatus})`);
}

// CLI: node holafly.mjs japan [italy ...]
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("holafly.mjs")) {
  const slugs = process.argv.slice(2);
  if (!slugs.length) {
    console.error("usage: node holafly.mjs <slug> [slug...]");
    process.exit(1);
  }
  const out = [];
  for (const s of slugs) {
    try {
      out.push(await fetchPlans(s));
    } catch (e) {
      console.error(e.message);
      process.exitCode = 1;
    }
    if (slugs.length > 1) await new Promise((r) => setTimeout(r, 1500));
  }
  console.log(JSON.stringify(out.length === 1 ? out[0] : out, null, 2));
}
