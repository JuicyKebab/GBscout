# GBScout (gbscout.com)

Neutrale eSIM-vergelijker voor reizigers, Engelstalig, wereldwijd. Dealoco-formule voor een andere niche: versnipperde prijsdata structureren, pSEO per land, affiliate als verdienmodel.

Zie `research.md` (keyword-data, vendors, projectie) en `mvp-scope.md` (scope, mijlpalen, succescriteria).

## Draaien

```
npm install
npm run ingest        # haalt plannen op en schrijft data/plans.json
npm run dev           # http://localhost:3000
npm run build
```

Zonder prijsdata (of met maar 1 provider voor een bestemming) toont een bestemming een lege toestand, staat op `noindex` en zit niet in de sitemap. Er worden nooit prijzen verzonnen.

## Structuur

- `app/` Next.js 16 App Router: `/`, `/esim/[slug]`, `/compare/[a]-vs-[b]`, `/alternatives/[provider]`, `/methodology`, `/affiliate-disclosure`, sitemap, robots.
- `lib/site.js` naam, domein, valuta (op een plek, voor hernoemen).
- `lib/destinations.js` bestemmingen (landen + regio's), `lib/providers.js` providers, paren en affiliate-links.
- `lib/data.js` leest `data/plans.json` en `data/providers-facts.json`, rangschikt, bepaalt of een pagina geindexeerd wordt (`hasPage`).
- `scripts/ingest.mjs` + `scripts/providers/<provider>.mjs` haalt de plannen op. Elk providerscript exporteert `fetchPlans(slug)`.
- `data/providers-facts.json` bronvermelde feiten per provider (uit de officiele pagina's, met datum).

## Data en ingest

- Alle prijzen worden in een valuta vergeleken (`SITE.currency`, USD). Rijen in een andere valuta worden niet gerangschikt.
- `ingest` laat een mislukte combinatie staan met zijn oude `fetched_at` en verwijdert items ouder dan 21 dagen (`--prune-days`), zodat de site geen verouderde prijzen als actueel toont. Elke pagina toont de datum van haar oudste prijs.
- Providers met scraper: Airalo, Holafly, Ubigi, Yesim. Jetpac staat on hold (`ON_HOLD` in `scripts/ingest.mjs`) omdat de prijzen op de pagina afwijken van Jetpacs eigen API en niet vaststaat welke bij de kassa geldt. Saily is niet gescraped: Cloudflare weigert niet-browser-clients.
- Unlimited-plannen worden op gangbare duren gehouden (1, 3, 5, 7, 10, 14, 15, 20, 30, 60, 90 dagen), voor alle providers gelijk.
- De Airalo-scraper gebruikt de (ongedocumenteerde) API die Airalo's eigen website aanroept. Dat kan zonder aankondiging veranderen. De officiele routes zijn de Airalo Partner API of de Travelpayouts-feed (account nodig).

## Affiliate

Zet per provider `AFF_<PROVIDER>` in `.env.local` (zie `.env.example`). Zonder waarde linkt de site naar de gewone provider-URL zonder `rel="sponsored"`. Met waarde gaat de klik via de affiliate-URL (`{url}` en `{subid}` worden ingevuld; subid = paginanaam).

## Deployen (Cloudflare Workers, statische export)

De site is een statische export (`output: "export"`): `npm run build` schrijft de map `out/`, een Worker (`wrangler.jsonc`) serveert die. Redirects staan in `public/_redirects` (Next's `redirects()` werkt niet in een export).

```
npm run preview   # bouwt en serveert lokaal zoals Cloudflare (http://127.0.0.1:8788)
npm run deploy    # bouwt en deployt (eerst: npx wrangler login)
```

`NEXT_PUBLIC_*` en `AFF_*` worden bij het bouwen ingevuld, dus na het wijzigen ervan opnieuw bouwen en deployen. Lokaal staan ze in `.env.local`.

Domein: gbscout.com staat bij Namecheap, de DNS bij Cloudflare (nameservers gewijzigd). Na "Active" in Cloudflare: Worker, Settings, Domains, Add custom domain (`gbscout.com` en `www`). Mail: Cloudflare Email Routing.

Automatische prijsupdate: `.github/workflows/refresh.yml` draait dagelijks de ingest, controleert de data (`scripts/check-data.mjs` weigert een dunne of verouderde dataset, dan blijft de vorige versie live), commit `data/plans.json`, bouwt en deployt. Instellen in GitHub: secrets `CLOUDFLARE_API_TOKEN` en `CLOUDFLARE_ACCOUNT_ID`; variables `NEXT_PUBLIC_OPERATOR_NAME`, `NEXT_PUBLIC_OPERATOR_ADDRESS`, `NEXT_PUBLIC_CONTACT_EMAIL`; later de `AFF_*`-secrets. Risico: de scrapers draaien dan vanaf GitHub's servers (datacenter-IP's); sommige sites kunnen die blokkeren. Test met "Run workflow" voordat je erop vertrouwt. Valt dat tegen, dan werkt `npm run ingest && npm run deploy` vanaf je eigen computer.

## Voor livegang

- Domein gbscout.com registreren (was op 3 oktober 2026 vrij volgens het .com-register; controleer de prijs bij je registrar, merkrechten in EU en VS, en de social handles) en `NEXT_PUBLIC_SITE_URL` zetten.
- Affiliate-accounts aanmaken (Travelpayouts voor Airalo/Yesim, Impact voor Ubigi/Jetpac, Nord voor Saily) en de `AFF_*`-variabelen vullen.
- `NEXT_PUBLIC_OPERATOR_NAME`, `NEXT_PUBLIC_OPERATOR_ADDRESS` en `NEXT_PUBLIC_CONTACT_EMAIL` zetten. Ze verschijnen op `/privacy` en `/methodology`. Zonder deze gegevens laat `/privacy` de sectie "Who is responsible" weg, wat voor een privacybeleid (GDPR) en voor affiliate-aanvragen niet volstaat. Eerst invullen, dan pas aanvragen.
- `/privacy` zegt nu "geen cookies, geen analytics". Voeg je analytics, cookies of een nieuwsbrief toe, pas dan eerst de tekst aan (en voeg cookie-consent toe).
- Ingest dagelijks of wekelijks plannen (cron) en na elke ingest herbouwen.
- Search Console verifieren en de sitemap indienen. Analytics en cookie-consent zitten er bewust nog niet in.
- Reisverzekering/VPN-cross-sell is nog niet gebouwd (zie research.md).
