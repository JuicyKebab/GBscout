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
  openGraph: { type: "website", url: SITE.url, siteName: SITE.name, title: `${SITE.name}: ${SITE.tagline}`, description: DESCRIPTION },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col bg-stone-50 font-sans text-stone-900 antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CookieConsent />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
