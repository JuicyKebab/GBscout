# Marketing Audit — gbscout.com
2026-10-05 · Overall score: **53/100** · Basis: live fetch of home, /esim, /esim/japan, /methodology, /affiliate-disclosure, /providers/airalo, /compare/airalo-vs-holafly + competitor pages (Airalo, Holafly, Saily, esimdb.com, esimradar.com). Six-dimension fan-out, synthesised here.

> Scores are marketing-judgement heuristics, not measured performance. Median real site = 55-70. No brand-context.md exists for this project → findings are un-contextualised on ICP/voice (offer to generate one stands).

## The one thing

GBScout has the better *mechanism* (price-per-GB ranking, an honest dated "checked" stamp, and genuinely self-damaging compare pages a provider would never publish) and the worse *position*: it sells itself as "another independent eSIM price comparison with fresh prices" — the exact pitch **esimradar.com and esimdb.com already own at 20x the scale** (esimradar: 102 providers, 234 destinations, 560k plans, daily auto-refresh vs GBScout's 5 providers / 75 destinations / one static per-page date). So the site competes on the one battle it loses (breadth + freshness + "independent") while hiding the two it can win (curated depth and verifiable honesty) below a generic "find the cheapest eSIM" headline, with no human name attached and no capture loop. Every weak dimension is that same root. The fix is a reposition, not a rebuild: stop being "a smaller aggregator," become "the show-our-work shortlist run by a real person who has zero commission reason to rank anyone first" — then put a face on it, add a second metric so the flagship number stops going silent on unlimited plans, and turn the honest data into something linkable.

## Scorecard

| Dimension | Score | Weight | Weighted | Verdict |
|---|---|---|---|---|
| Messaging & positioning | 64 | 25% | 16.0 | Clear and honest; the real wedge (per-GB + checked date) is a footnote, not the headline |
| Conversion | 52 | 20% | 10.4 | Smart ranking table, but the row→affiliate click is a bare "View plan" with no hand-off framing or risk reversal |
| Search & discoverability | 58 | 20% | 11.6 | Clean pSEO + solid schema, but thin interlink mesh and zero backlinks on a contested SERP |
| Competitive position | 44 | 15% | 6.6 | The "independent + fresh" pitch is already owned by esimradar at far greater scale |
| Trust & credibility | 58 | 10% | 5.8 | Unusually honest methodology, undercut by an anonymous shell with no human or contact |
| Growth & retention | 30 | 10% | 3.0 | Zero capture, zero repeat loop, no linkable asset for a domain that needs backlinks |
| **Total** | **53** | 100% | **53.4** | Good bones, wrong fight, no face |

## Fix these first

High-impact / low-effort, in order. Copy written out — paste, don't paraphrase.

### 1. Reposition the hero off the contested line and onto curation — S, confidence H
Current H1 "Find the cheapest eSIM for your trip" is what Airalo, Holafly and esimdb all imply; the per-GB + checked-date wedge sits in a stat line below. And "independent price comparison" is esimradar's line verbatim.
- **H1:** `Compare eSIM prices by cost per GB — and see exactly when we checked`
- **Subhead:** `esimdb and esimradar list everything. GBScout ranks every plan by price per gigabyte, shows the date each price was verified, and tells you which few are actually worth buying.`
- **Affiliate+independence line directly under it (also on provider/compare pages):** `We may earn a commission if you buy through our links. It never affects ranking — ranking uses price only.`
- Why: moves the differentiator from footnote to headline, and swaps a battle you lose (breadth/freshness) for one you win (curated depth + shown work).

### 2. Turn table rows into real buy actions + kill eSIM purchase anxiety at the row — S, confidence H
Every row is an identical-weight "View plan" text link that names neither the provider nor that you leave the site; the two biggest eSIM objections (device compatibility, activation hassle) sit in an FAQ far from the CTA.
- **CTA per row (solid button, provider name swapped):** `Buy on Ubigi →`
- **One line directly under each destination table:** `Works on any unlocked eSIM-capable phone (iPhone XS+, most Pixel/Galaxy from 2019+). Install takes under 5 minutes: scan a QR code sent by email — no SIM swap, no store visit.`
- **Trust cue beside the top-ranked plan (real data, no fabrication):** `Rated 4.2/5 (12,000+ reviews) · Refundable before activation on most plans.` — pull real provider rating into a table column.

### 3. Put a named human + contact on the site — S, confidence H
No operator name, no contact, no /about anywhere — reads as an anonymous affiliate shell despite the strong methodology.
- **Footer + new /about (linked from /methodology):** `GBScout is built and maintained by [NEED: full name], a solo operator. Questions, or a price you think is wrong? Email [name]@gbscout.com — I read every message.`
- **Under the "prices checked [date]" stamp on each country page:** `Checked by opening [Provider]'s own destination page — the same page you land on if you click through.`
- Why: single biggest lever on trust; also the accountability that makes the "no paid placement" promise actually credible.

### 4. Fix the internal-link mesh — S, confidence H
Destinations link out to compare/providers, but compare/provider pages link back to only a handful; homepage surfaces 12 of 75 countries; most destination pages are 3+ clicks deep. On a zero-backlink site, internal links are the only authority-distribution lever.
- Add a "Compare all providers" footer module to every `/compare/*` linking all 6 permutations.
- Add an "Also compared against" strip on every `/providers/*` linking the other 4 providers' compare pages.
- On every `/esim/[country]`, link the #1-ranked provider to its `/providers/[provider]` page contextually (not just via the generic 5-provider list).
- One shared component, ~86 pages.

### 5. Add a second metric + the anti-incumbent counter-signal — M, confidence M/H
The flagship price-per-GB number goes silent on unlimited-only providers — including Holafly, 1 of your 5. And there's no "why us over esimdb/esimradar" story.
- **Add and promote cost-per-day-of-trip alongside $/GB:** market it as `Two honest numbers: $/GB for data plans, $/day for unlimited plans.` Closes the gap where the headline metric can't rank Holafly-style plans.
- **Counter-signal on every comparison page (replaces the social-proof you can't match):** `We don't have 30 million users. We have zero commission reason to rank one provider above another — every price links straight to the provider's own page, so verify it yourself.` Pair with a visible "No paid placement" badge.

## What's already working

- **The `/compare/airalo-vs-holafly` content** — honest, dated, specific ("Airalo cheaper in 59/66 destinations," openly admits price/GB can't apply to unlimited-only Holafly). Commercially awkward truth a provider-owned site would never publish — the real differentiated substance, and the template for the whole repositioning. (Flagged by competitive + messaging.)
- **The "prices checked [date]" mechanism + methodology** — standardised per-GB math, explicit exclusions (plans under 3GB dropped), no invented FX rates, the quotable "a page is only as fresh as its oldest price." Unusually specific, falsifiable, and the strongest trust/freshness asset on the site. (Flagged by all of messaging, conversion, trust.)
- **Technical search base** — unique front-loaded titles, click-worthy metas with real numbers + dates ("Lowest price per GB: Ubigi at $1.10. Prices checked 3 October 2026"), single clean H1, and Product/Offer/BreadcrumbList/ItemList JSON-LD with extractable per-GB facts in plain prose under the H1 — exactly the format AI Overviews/Perplexity lift. The engine is sound; it lacks authority and a face.

## Full findings by dimension

### Messaging & positioning — 64/100
All five signals pass, but weakly on differentiation: the wedge is a trust-badge line, not the argument. Auto-cap not triggered (H1 names outcome + implied audience).
- Hero rewrite (Fix 1).
- Optional sharper variant to A/B: H1 `Stop overpaying for eSIM data: compare every plan by price per GB` / subhead `5 providers, 75 destinations, prices verified [date] — ranked by what you actually pay per gigabyte, not list price.` (M, M)
- Category note: Airalo/Holafly/Saily lead with emotion ("stay connected everywhere") because they sell plans and have no reason to mention price-per-GB; generic aggregators default to "compare eSIM plans" without committing to one ranking mechanic or disclosing staleness. The per-GB + checked-date mechanic is a genuine structural wedge — it just needs to move from footnote to headline.

### Conversion — 52/100
Pass only on proof placement ("checked [date]"). Fail on CTA hierarchy, wording, hand-off clarity, objections, risk reversal.
- Buy-on-[provider] buttons + device/activation reassurance + trust cue (Fix 2, all S-M).

### Search & discoverability — 58/100
Pass: titles, metas, headings, intent match, citability (schema solid). Fail: internal-link mesh.
- Mesh fix (Fix 4).
- **Link sprint, focused not broad:** stop treating this as 75 parallel bets; pick 5-8 lowest-competition country pages (niche destinations, not Japan/US/Europe), and earn ~5 referring domains in 60 days via niche travel-gear directories, 2 backpacker-blog guest posts (anchor "cheapest eSIM for [country]"), and a travel-blogger roundup pitched with an exclusive data cut. (M, H)
- **One unique 60-100 word paragraph per country** (network coverage quality, roaming quirks, "why prices here are high/low vs region") on top of the shared template — defuses doorway-page / helpful-content risk at 75 near-identical pages and is what LLMs quote instead of a table row. (L, M)
- Minor: destination pages emit **FAQPage JSON-LD** — restricted to gov/health since Aug 2023, yields no rich result on a commercial site. Keep the visible FAQ, remove the FAQPage schema block. (S)

### Competitive position — 44/100
Pass: named-alternatives content (the compare pages are real). Fail: category framing (borrowed), switching story, defensibility (esimradar does the same bigger + automated + more transparent on its commercial model).

| Competitor | Framing | GBScout exposed | Open flank to own |
|---|---|---|---|
| esimradar.com | "Independent price comparison," 560k plans, 102 providers, daily re-checks, published ranking rules | Near-identical positioning, but smaller + manual snapshot vs their infrastructure | Can't out-scale → out-depth: curated per-destination usability, not plan count |
| esimdb.com | "World's largest independent," 400k+ plans, 220+ brands, user reviews | 5 providers vs 220 + no reviews → looks like a sliver of their directory | "We only rank providers we've verified, not 220 brands of unknown quality" |
| Airalo | Marketplace, 30M users, 4.7★ | Zero scale/trust signals beside it | "We don't sell eSIMs, so zero reason to rank Airalo first" — radical neutrality |
| Holafly | "World's most trusted," unlimited-first, 113k reviews | Flagship $/GB metric can't rank Holafly's unlimited plans | A second metric (cost-per-day) that covers unlimited too |

- Reposition + counter-signal + second metric (Fixes 1 & 5).

### Trust & credibility — 58/100
Pass: claim specificity, design, (strong) methodology. Fail: no named human, no third-party validation, no contact/about.
- Named human + contact + verifiability line (Fix 3).
- On /affiliate-disclosure, attach it to a person: `This disclosure is made by [NEED: name], who built and runs GBScout. Think a ranking was influenced by commission? Email me and I'll show you the numbers.` (S)
- Later, once volume exists: Trustpilot badge at ≥20 reviews. (L)

### Growth & retention — 30/100
Pass: value-exchange legibility. Fail: acquisition, expansion, lifecycle.
- **Price-drop email capture, below each country table** (uses the price-check cadence you already run): `Get a cheaper eSIM for Japan. We check prices here weekly — leave your email and we'll tell you the moment a plan beats today's $X.XX/GB. One email per drop, nothing else.` `[email] [Alert me]`. Backend: store (email, country, price_at_signup); weekly cron diffs cheapest vs stored, fires on drop. (M, H)
- **Linkable asset `/cheapest-esim-right-now`** — live table of all 75 destinations by $/GB from existing data, "last updated [date]," one embeddable stat ("Cheapest eSIM in the world right now: [Country] at $X.XX/GB"). Pitch cold to r/digitalnomad, r/travel, travel newsletters. Data stories earn links; comparison pages don't. (M, H)
- **Capture on the compare/alternatives cluster** (high-intent, currently 100% outbound): inline box `Not sure which is cheapest for your trip? Tell us where you're going — we'll show the cheapest option and email you if it changes before you leave.` `[destination dropdown] [email, optional] [Show me]` → routes to /esim/[country], email feeds the same alert system. (S, M)

## Appendix: lower-priority
- Trustpilot badge (needs ≥20 reviews).
- A/B the sharper "stop overpaying" hero variant against the curation-led one.
- Per-country unique paragraph rollout (batch by region).
- Remove FAQPage JSON-LD site-wide.

## What I couldn't determine
- **No brand-context.md** → un-contextualised on ICP/voice. Offer to generate stands.
- Operator name/launch details — marked `[NEED: …]`; fill before publishing, never fabricate.
- Saily page returned 403 (framing unknown); Nomad not deeply explored.
- Real provider ratings/review counts for Fix 2's trust cue must be pulled from Trustpilot/App Store, not invented.
- Scores are heuristic. Search + growth will move most once GSC data, backlinks, and capture exist (re-audit at 4-8 weeks).
