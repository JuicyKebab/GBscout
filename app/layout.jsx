import "./globals.css";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CookieConsent from "@/components/CookieConsent";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import { organizationJsonLd } from "@/lib/schema";

const DESCRIPTION =
  "Compare eSIM plans by provider and destination. Every plan is ranked by price per GB, and every page shows when its prices were checked.";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: DESCRIPTION,
  // Only non-page-specific OG fields here. Leaving out title/description/url lets Next
  // derive og:title, og:description and og:url per page from each page's title/description/
  // canonical, instead of every subpage inheriting the homepage card (SEO/share fix).
  openGraph: { type: "website", siteName: SITE.name },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col bg-stone-50 font-sans text-stone-900 antialiased">
        {/* Impact affiliate network site verification (hoisted to <head> by React 19) */}
        <meta name="impact-site-verification" value="588019a1-cfdf-40c1-963a-227b2e7017a2" />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CookieConsent />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
