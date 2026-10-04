import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// Eén site-brede share-afbeelding. Wordt op build-tijd statisch gegenereerd (output: "export")
// en vult zowel og:image als twitter:image (Next valt voor twitter terug op deze afbeelding).
export const dynamic = "force-static";
export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f766e", // teal-700, merkkleur
          color: "#fafaf9", // stone-50
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.02em" }}>{SITE.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            Find the cheapest eSIM for your trip
          </div>
          <div style={{ fontSize: 34, color: "#99f6e4" }}>
            Every plan ranked by price per GB, with the date we checked it.
          </div>
        </div>
        <div style={{ fontSize: 30, color: "#ccfbf1" }}>gbscout.com</div>
      </div>
    ),
    size
  );
}
