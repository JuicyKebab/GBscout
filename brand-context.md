# Brand context

Context for the marketing-agi skill (and any copy work). Generated 2026-10-05 from the live site + codebase. Update as the product evolves.

---

## Product
What it is, in one sentence a stranger would understand:
GBScout compares travel eSIM prices across a curated set of providers, ranking every plan by cost per GB (and unlimited plans by cost per day) and showing the date each price was checked.

What it actually does (the mechanism, not the promise):
Static pSEO site (Next export on Cloudflare). ~75 destination pages (/esim/<country>), 5 provider pages (/providers/<p>), compare pages (/compare/<a>-vs-<b>), alternatives pages, /methodology, /affiliate-disclosure. Pulls plan prices into data/plans.json, ranks fixed plans by price per GB and unlimited plans by price per day, drops rows in a non-USD currency rather than inventing FX rates, and hands off to the provider via affiliate link to buy. Earns commission on provider sign-ups.

What it does NOT do (prevents overclaiming):
Does NOT sell eSIMs or take payment. Does NOT convert currencies (non-USD rows are shown but not ranked). Does NOT measure network quality, speed, or support. Does NOT list every provider (curated, 5 verified) — unlike esimdb/esimradar.

## Audience
Who buys it:
English-speaking travellers who need mobile data abroad and own an eSIM-capable, unlocked phone. Price-conscious; booking a specific trip.

What they believe before they arrive:
"eSIMs are confusing, prices are all over the place, and I don't know which provider is actually cheapest or legit."

What they worry about at 2am:
Will it work on my phone; is activation a hassle; am I overpaying; is this comparison site trustworthy or just pushing whoever pays most.

What they'd use instead if you didn't exist:
Airalo/Holafly/Saily directly, esimdb.com or esimradar.com, or a Reddit thread.

## Positioning
The one thing true about us that a competitor could not also say:
We only rank providers we've verified (curated, not a 220-brand directory), we show our work (dated price checks + a methodology + compare pages that admit when our own flagship metric doesn't apply), and we have zero commission reason to rank one provider above another because ranking uses price only.

Category we compete in:
Independent eSIM price comparison / pre-trip planning. NOTE: "independent eSIM price comparison" is esimradar.com's exact line at 20x scale — do NOT lead with it. Lead with curation + shown work.

Named competitors:
Providers: Airalo, Holafly, Saily, Ubigi, Yesim, Nomad. Aggregators (the real rivals): esimdb.com, esimradar.com.

## Proof
Numbers we can cite (with source and date):
5 providers, ~75 destinations, prices dated per page (data/plans.json + price-history.json). NO user counts, NO reviews, NO booking volume — do not imply any. Provider ratings for CTAs must come from Trustpilot/App Store, never invented.

Named customers we're allowed to name:
None. No testimonials. Never fabricate.

Claims that need legal sign-off:
Affiliate disclosure must stay accurate (commission, ranking unaffected, price unchanged for user).

## Voice
How we sound:
Plain, honest, show-the-work. Specific over superlative. Slightly contrarian about the industry (no paid placement, no hype).

How we never sound:
Hypey, urgent, "stay connected everywhere" marketing-speak. No fake scarcity.

Words we always use:
price per GB, price per day, checked [date], ranking uses price only, verify it yourself.

Words we never use:
"best eSIM guaranteed", "unbeatable", "seamless", "unlock", em dashes, fabricated stats.

## Constraints
Regulatory or legal limits:
Affiliate disclosure required + present. No fabricated stats/reviews/FX rates.

Anything off-limits:
Operator name/email are intentionally env-driven (NEXT_PUBLIC_OPERATOR_NAME / NEXT_PUBLIC_CONTACT_EMAIL) and must NOT be hardcoded or placeholder'd in source. FAQPage JSON-LD should not ship (restricted to gov/health since Aug 2023) — keep visible FAQ only.
