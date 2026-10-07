// Veiligheidscontrole vóór een deploy: stopt (exit 1) als data/plans.json er verdacht dun uitziet.
// Zo zet een kapotte scraper nooit een bijna lege site live. De drempels staan bewust ruim onder
// de huidige stand (26 bestemmingen x 4 providers = 104 items).
import fs from "node:fs";

const MIN_ITEMS = 60;
const MIN_PROVIDERS = 3;
const MIN_DESTINATIONS = 15;
const MAX_AGE_DAYS = 3; // de nieuwste meting mag niet ouder zijn: anders is de ingest stilgevallen

const d = JSON.parse(fs.readFileSync("data/plans.json", "utf8"));
const items = d.items || [];
const providers = new Set(items.map((i) => i.provider));
const destinations = new Set(items.map((i) => i.slug));
const newest = Math.max(0, ...items.map((i) => new Date(i.fetched_at).getTime() || 0));
const ageDays = (Date.now() - newest) / 86400000;

const problems = [];
if (items.length < MIN_ITEMS) problems.push(`only ${items.length} items (min ${MIN_ITEMS})`);
if (providers.size < MIN_PROVIDERS) problems.push(`only ${providers.size} providers (min ${MIN_PROVIDERS})`);
if (destinations.size < MIN_DESTINATIONS) problems.push(`only ${destinations.size} destinations (min ${MIN_DESTINATIONS})`);
if (ageDays > MAX_AGE_DAYS) problems.push(`newest measurement is ${ageDays.toFixed(1)} days old (max ${MAX_AGE_DAYS})`);

console.log(`data check: ${items.length} items, ${providers.size} providers, ${destinations.size} destinations, newest ${ageDays.toFixed(1)} days old`);
if (problems.length) {
  console.error("DATA CHECK FAILED:\n - " + problems.join("\n - "));
  process.exit(1);
}
