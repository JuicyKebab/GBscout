import { absoluteUrl } from "@/lib/site";

// Vereist voor `output: "export"` (statische build).
export const dynamic = "force-static";

// Alle crawlers, ook AI-crawlers, mogen alles lezen. Dat is een zakelijke keuze: AI-citaties
// zijn een groeikanaal voor deze site. Wil je ze weren, voeg hier per user-agent een regel toe.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
