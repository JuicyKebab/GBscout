export const PROVIDERS = {
  airalo: { name: "Airalo", site: "https://www.airalo.com", affEnv: "AFF_AIRALO" },
  holafly: { name: "Holafly", site: "https://esim.holafly.com", affEnv: "AFF_HOLAFLY" },
  saily: { name: "Saily", site: "https://saily.com", affEnv: "AFF_SAILY" },
  nomad: { name: "Nomad", site: "https://www.nomadesim.com", affEnv: "AFF_NOMAD" },
  ubigi: { name: "Ubigi", site: "https://www.ubigi.com", affEnv: "AFF_UBIGI" },
  yesim: { name: "Yesim", site: "https://yesim.app", affEnv: "AFF_YESIM" },
  jetpac: { name: "Jetpac", site: "https://www.jetpacglobal.com", affEnv: "AFF_JETPAC" },
};

export const PROVIDER_SLUGS = Object.keys(PROVIDERS);

// Mensvriendelijke bestemmingspagina per provider. De `source_url` in data/plans.json is de
// URL waar het scraperscript de data haalde (bij Airalo een JSON-API) en mag nooit als link
// naar bezoekers dienen. Providers zonder sjabloon vallen terug op hun eigen `source_url`.
// Ubigi's catalogus is een pagina voor alle landen; de eigen links gebruiken ?destination=<ISO3>
// of ?region=<naam>. Een onbekende parameter laat de pagina gewoon laden.
const UBIGI_BASE = "https://cellulardata.ubigi.com/data-plans-and-coverage/ubigi-esim-data-plans/?wmc-currency=USD";
const UBIGI_ISO3 = {
  "united-states": "usa", japan: "jpn", "united-kingdom": "gbr", italy: "ita", china: "chn", canada: "can", mexico: "mex",
  france: "fra", thailand: "tha", spain: "esp", philippines: "phl", india: "ind", australia: "aus", vietnam: "vnm",
  turkey: "tur", "costa-rica": "cri", portugal: "prt", ireland: "irl", "south-korea": "kor", germany: "deu",
  greece: "grc", indonesia: "idn", singapore: "sgp",
  "taiwan": "twn", "new-zealand": "nzl", "iceland": "isl", "colombia": "col", "brazil": "bra", "peru": "per",
  "hong-kong": "hkg", "switzerland": "che", "morocco": "mar", "dominican-republic": "dom", "egypt": "egy",
  "south-africa": "zaf", "israel": "isr", "uae": "are", "jamaica": "jam", "panama": "pan", "norway": "nor",
  "sweden": "swe", "saudi-arabia": "sau", "croatia": "hrv", "chile": "chl", "ecuador": "ecu", "cuba": "cub",
  "albania": "alb", "kenya": "ken", "pakistan": "pak", "malaysia": "mys", "denmark": "dnk", "cambodia": "khm",
  "lebanon": "lbn", "tanzania": "tza", "jordan": "jor", "austria": "aut", "tunisia": "tun", "bahamas": "bhs",
  "laos": "lao", "sri-lanka": "lka", "romania": "rou", "fiji": "fji", "hungary": "hun", "russia": "rus",
  "puerto-rico": "pri", "uzbekistan": "uzb", "argentina": "arg", "georgia": "geo", "maldives": "mdv",
  "bolivia": "bol", "cyprus": "cyp", "poland": "pol", "qatar": "qat", "netherlands": "nld",
};

// Saily's land-slug wijkt soms af van de onze (sync houden met scripts/providers/saily.mjs).
const SAILY_PAGE_SLUG = { uae: "united-arab-emirates" };

const DESTINATION_PAGE = {
  airalo: (slug) => `https://www.airalo.com/${slug}-esim`,
  ubigi: (slug) => {
    if (slug === "europe" || slug === "asia") return `${UBIGI_BASE}&region=${slug}`;
    return UBIGI_ISO3[slug] ? `${UBIGI_BASE}&destination=${UBIGI_ISO3[slug]}` : null;
  },
  saily: (slug) => `https://saily.com/esim-${SAILY_PAGE_SLUG[slug] || slug}/`,
};

export function destinationUrl(provider, slug) {
  const build = DESTINATION_PAGE[provider];
  return build ? build(slug) : null;
}

export function providerName(slug) {
  return PROVIDERS[slug]?.name || slug;
}

// Canoniek paar -> "a-vs-b". Alleen paren waarvoor beide providers prijsdata hebben worden
// geindexeerd (zie lib/data.js). De omgekeerde volgorde redirect via next.config.mjs.
export const PAIRS = [
  ["airalo", "holafly"],
  ["saily", "airalo"],
  ["airalo", "nomad"],
  ["airalo", "ubigi"],
  ["airalo", "yesim"],
  ["airalo", "jetpac"],
  ["holafly", "saily"],
  ["ubigi", "yesim"],
];

export const pairSlug = ([a, b]) => `${a}-vs-${b}`;

export function parsePair(slug) {
  const hit = PAIRS.find((p) => pairSlug(p) === slug);
  return hit || null;
}

/**
 * Uitgaande link. Met een affiliate-template in de omgeving (AFF_<PROVIDER>) gaat de klik via
 * de affiliate-URL en krijgt de link rel="sponsored". Zonder template: gewone provider-URL.
 * `subid` = paginanaam, zodat het netwerk de omzet per pagina kan toewijzen.
 */
export function outbound(providerSlug, { url, subid }) {
  const p = PROVIDERS[providerSlug];
  const target = url || p?.site || "#";
  const template = p ? process.env[p.affEnv] : "";
  if (template) {
    const href = template
      .replaceAll("{url}", encodeURIComponent(target))
      .replaceAll("{subid}", encodeURIComponent(subid || "site"));
    return { href, rel: "sponsored nofollow noopener", affiliate: true };
  }
  return { href: target, rel: "noopener", affiliate: false };
}
