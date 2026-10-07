import { SITE, SAME_AS, absoluteUrl } from "./site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#org`,
        name: SITE.name,
        url: SITE.url,
        description:
          "Curated eSIM price comparison. Ranks travel eSIM plans by cost per GB (and unlimited plans by price per day), and dates every price it checks.",
        knowsAbout: ["eSIM", "travel eSIM", "mobile data roaming", "prepaid data plans", "eSIM providers"],
        ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
      },
      { "@type": "WebSite", "@id": `${SITE.url}/#site`, url: SITE.url, name: SITE.name, publisher: { "@id": `${SITE.url}/#org` } },
    ],
  };
}

export function breadcrumbJsonLd(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absoluteUrl(t.path),
    })),
  };
}

export function faqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** ItemList van de goedkoopste plannen. Platte ListItems (naam + url), geen Product:
 * we zijn een prijs-index, geen verkoper, dus Product/Offer-markup triggert Google's
 * Product-rich-result-validatie (verplicht image/review/rating die we niet eerlijk
 * kunnen vullen) -> "geindexeerd, maar met problemen". currency ongebruikt sinds de
 * Offer weg is; blijft in de signatuur voor de aanroepers. */
export function itemListJsonLd({ name, rows, labelOf }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: rows.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: labelOf(r),
      url: r.sourceUrl,
    })),
  };
}
