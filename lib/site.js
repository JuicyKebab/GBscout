// Alles wat bij een hernoeming of domeinwissel verandert staat hier op een plek.
// Gekozen naam: GBScout (gbscout.com was op 3 oktober 2026 vrij volgens het .com-register;
// merkrechten en social handles nog zelf te controleren).
export const SITE = {
  name: "GBScout",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://gbscout.com").replace(/\/$/, ""),
  tagline: "Compare eSIM prices by cost per GB",
  // Alle prijzen worden in een valuta vergeleken. Rijen in een andere valuta worden
  // niet gerangschikt (geen verzonnen wisselkoersen).
  currency: "USD",
  // Wie verantwoordelijk is voor de site. Bewust uit de omgeving: deze gegevens horen NIET verzonnen
  // of als placeholder live te staan. Zonder waarde laat de privacy-pagina de sectie weg.
  operatorName: process.env.NEXT_PUBLIC_OPERATOR_NAME || "",
  operatorAddress: process.env.NEXT_PUBLIC_OPERATOR_ADDRESS || "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
};

// Entity-profielen (sameAs) voor het Organization-schema: komma-gescheiden URLs in env,
// na aanmaken socials/Crunchbase/Product Hunt/etc. (AEO: entity + consensus).
export const SAME_AS = (process.env.NEXT_PUBLIC_SAME_AS || "").split(",").map((s) => s.trim()).filter(Boolean);

export function absoluteUrl(pathname = "/") {
  return `${SITE.url}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
