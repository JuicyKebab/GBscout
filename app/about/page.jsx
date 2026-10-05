import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "About",
  description:
    "Who runs GBScout, why it exists, and how it makes money: a curated, price-only eSIM comparison that shows its work.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];
  const email = SITE.contactEmail;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 max-w-3xl text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">
        About {SITE.name}
      </h1>
      <div className="mt-6 max-w-2xl space-y-5 text-pretty text-stone-800">
        <p>
          {SITE.operatorName
            ? `Hi, I'm ${SITE.operatorName}. I built ${SITE.name} because eSIM pricing is deliberately hard to compare: every provider sizes plans differently, hides the per-GB cost, and quotes prices that drift week to week.`
            : `${SITE.name} exists because eSIM pricing is deliberately hard to compare: every provider sizes plans differently, hides the per-GB cost, and quotes prices that drift week to week.`}{" "}
          So {SITE.operatorName ? "I" : "we"} rank every plan by what a gigabyte actually costs (and unlimited plans by
          price per day), and show the date each price was last checked.
        </p>
        <p>
          {SITE.name} is not a reseller and does not sell eSIMs. {SITE.operatorName ? "I" : "We"} only list providers
          after verifying their prices, which is why you see a curated handful rather than a 200-brand directory. The
          ranking uses price only. It is never influenced by commission.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-stone-900">How {SITE.name} makes money</h2>
        <p>
          Some links are affiliate links: if you buy through them, the provider pays {SITE.name} a commission at no extra
          cost to you, and you pay the same price you would going direct. That is what funds the price checking. It does
          not change the order plans are ranked in. The full detail is on the{" "}
          <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-stone-900">affiliate disclosure</Link>{" "}
          page, and how the ranking works is on the{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-stone-900">methodology</Link> page.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-stone-900">Contact</h2>
        <p>
          {email ? (
            <>
              Spotted a price that looks wrong, or a provider {SITE.operatorName ? "I" : "we"} should add? Email{" "}
              <a href={`mailto:${email}`} className="underline underline-offset-2 hover:text-stone-900">{email}</a>.{" "}
              {SITE.operatorName ? "I read every message." : "We read every message."}
            </>
          ) : (
            <>Contact details are published on the{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-stone-900">privacy page</Link>.</>
          )}
        </p>
      </div>
    </div>
  );
}
