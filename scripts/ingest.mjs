// Haalt plannen op via scripts/providers/<provider>.mjs en schrijft data/plans.json.
//
//   node scripts/ingest.mjs                                  alle providers x alle bestemmingen
//   node scripts/ingest.mjs --providers airalo --slugs japan,italy
//   node scripts/ingest.mjs --prune-days 21                  oudere items worden verwijderd
//
// Een mislukte combinatie laat het vorige item staan (met zijn oude fetched_at); items ouder dan
// --prune-days (standaard 21) verdwijnen, zodat de site nooit verouderde prijzen als actueel toont.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "plans.json");
const PROVIDER_DIR = path.join(ROOT, "scripts", "providers");

const ALL_SLUGS = [
  "united-states", "japan", "europe", "united-kingdom", "italy", "china", "canada", "mexico", "france",
  "thailand", "spain", "philippines", "india", "australia", "vietnam", "turkey", "costa-rica", "asia",
  "portugal", "ireland", "south-korea", "germany", "greece", "indonesia", "singapore", "global",
  "taiwan", "new-zealand", "iceland", "colombia", "brazil", "peru", "hong-kong", "switzerland", "morocco",
  "dominican-republic", "egypt", "south-africa", "israel", "uae", "jamaica", "panama", "norway", "sweden",
  "saudi-arabia", "croatia", "chile", "ecuador", "cuba", "albania", "kenya", "pakistan", "malaysia",
  "denmark", "cambodia", "lebanon", "tanzania", "jordan", "austria", "tunisia", "bahamas", "laos",
  "sri-lanka", "romania", "fiji", "hungary", "russia", "puerto-rico", "uzbekistan", "argentina", "georgia",
  "maldives", "bolivia", "cyprus", "poland", "qatar", "netherlands",
];
const DELAY_MS = 1500;

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Sommige providers verkopen "unlimited" voor elke dag van 1 tot 90 (Yesim, Holafly). Voor een
// leesbare, vergelijkbare tabel houden we alleen de gangbare duren over, voor alle providers gelijk.
const UNLIMITED_DAYS = new Set([1, 3, 5, 7, 10, 14, 15, 20, 30, 60, 90]);

function cleanPlans(plans) {
  const out = [];
  for (const p of plans || []) {
    const price = Number(p.price);
    const validity = Number(p.validity_days);
    const unlimited = !!p.unlimited;
    const dataGb = p.data_gb == null ? null : Number(p.data_gb);
    if (!(price > 0) || !(validity > 0) || (!unlimited && !(dataGb > 0))) continue;
    if (unlimited && !UNLIMITED_DAYS.has(validity)) continue;
    // Plannen met bellen/sms kosten meer voor dezelfde data en zijn niet vergelijkbaar met alleen-data.
    if (/\b(mins?|minutes|sms|voice|calls?)\b/i.test(p.plan_name || "")) continue;
    out.push({
      data_gb: unlimited ? null : dataGb,
      unlimited,
      validity_days: validity,
      price,
      plan_name: p.plan_name || null,
      network: p.network || null,
    });
  }
  return out;
}

async function readExisting() {
  try {
    return JSON.parse(await fs.readFile(OUT, "utf8"));
  } catch {
    return { generated_at: null, items: [] };
  }
}

// Providers waarvan we de prijzen NIET publiceren tot een open vraag is opgelost. Jetpac: de
// prijzen op de pagina wijken af van die in Jetpacs eigen API (bv. Japan 10 GB/30 dagen: $16 op
// de pagina, $13,99 in de API) en het is niet vastgesteld welke bij de kassa geldt. Expliciet
// opvragen kan nog: --providers jetpac.
const ON_HOLD = new Set(["jetpac"]);

async function main() {
  const available = (await fs.readdir(PROVIDER_DIR)).filter((f) => f.endsWith(".mjs")).map((f) => f.replace(/\.mjs$/, ""));
  const providers = (arg("providers") ? arg("providers").split(",") : available.filter((p) => !ON_HOLD.has(p))).filter((p) => available.includes(p));
  const skipped = available.filter((p) => ON_HOLD.has(p) && !providers.includes(p));
  if (skipped.length) console.log(`On hold (not fetched): ${skipped.join(", ")}\n`);
  const slugs = arg("slugs") ? arg("slugs").split(",") : ALL_SLUGS;
  const pruneDays = Number(arg("prune-days") || 21);

  const existing = await readExisting();
  const byKey = new Map((existing.items || []).map((i) => [`${i.provider}|${i.slug}`, i]));
  let ok = 0;
  let failed = 0;

  for (const provider of providers) {
    const mod = await import(pathToFileURL(path.join(PROVIDER_DIR, `${provider}.mjs`)).href);
    for (const slug of slugs) {
      try {
        const res = await mod.fetchPlans(slug);
        const plans = cleanPlans(res.plans);
        if (!plans.length) throw new Error("no valid plans parsed");
        byKey.set(`${provider}|${slug}`, {
          provider,
          slug,
          source_url: res.source_url,
          fetched_at: res.fetched_at,
          currency: res.currency,
          plans,
        });
        ok += 1;
        console.log(`ok     ${provider} ${slug} (${plans.length} plans, ${res.currency})`);
      } catch (e) {
        failed += 1;
        console.log(`FAILED ${provider} ${slug}: ${e.message}`);
      }
      await sleep(DELAY_MS);
    }
  }

  const cutoff = Date.now() - pruneDays * 86400000;
  const items = [...byKey.values()]
    .filter((i) => i.fetched_at && new Date(i.fetched_at).getTime() >= cutoff)
    .sort((a, b) => a.slug.localeCompare(b.slug) || a.provider.localeCompare(b.provider));
  const dropped = byKey.size - items.length;

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify({ generated_at: new Date().toISOString(), items }, null, 2) + "\n");
  console.log(`\nDone: ${ok} ok, ${failed} failed, ${dropped} pruned (older than ${pruneDays} days). ${items.length} items written.`);
  if (ok === 0 && failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
