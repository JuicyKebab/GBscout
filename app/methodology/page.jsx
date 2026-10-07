import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Methodology: how we collect and rank eSIM prices",
  description: "How we collect eSIM plan prices, how plans are ranked by price per GB, and what the numbers do not tell you.",
  alternates: { canonical: "/methodology" },
};

const CONTACT = SITE.contactEmail;

function Section({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-2xl font-semibold text-balance text-stone-900">{title}</h2>
      <div className="mt-3 space-y-3 text-pretty text-stone-700">{children}</div>
    </section>
  );
}

export default function MethodologyPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Methodology", path: "/methodology" },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">
        Methodology: how we collect and rank eSIM prices
      </h1>
      <p className="mt-4 text-lg text-pretty text-stone-800">
        {SITE.name} ranks eSIM plans by price. This page explains where the prices come from, how the ranking is calculated and
        what it does not cover.
      </p>

      <Section id="collect" title="What we collect">
        <p>
          For each provider and destination we read the plans listed on the provider's public destination page: the data allowance,
          the validity in days and the price. We do not buy plans or test them.
        </p>
        <p>
          Every destination page shows the date its oldest price was checked. A page is only as fresh as its oldest price.
        </p>
      </Section>

      <Section id="rank" title="How plans are ranked">
        <p>
          <strong className="font-semibold text-stone-900">Fixed-data plans</strong> are ranked by price per GB: the price divided by the
          data allowance. This puts a 20 GB plan and a 1 GB plan on the same scale. The "lowest price per GB" highlight only counts plans of
          3 GB or more, to leave out plans too small for most trips.
        </p>
        <p>
          <strong className="font-semibold text-stone-900">Unlimited plans</strong> have no GB to divide by, so they are listed by trip length, and the
          cheapest plan for each length is highlighted. A price per day is shown for reference. We keep common lengths (1, 3, 5, 7, 10,
          14, 15, 20, 30, 60 and 90 days) so providers can be compared like for like. Many unlimited plans slow down after a daily
          amount of data; the providers' own statements are quoted on the comparison pages.
        </p>
        <p>
          On a provider-versus-provider page, we take each provider's lowest price per GB in every destination both cover and count
          in how many destinations each one is cheaper. When one of the two sells only unlimited plans, we compare the price of each
          provider's 7-day unlimited plan instead, and the page says so.
        </p>
      </Section>

      <Section id="currency" title="Currency">
        <p>
          Prices are compared in one currency ({SITE.currency}). If a provider's prices are only available in another currency, that
          provider is listed as not ranked for that destination. We do not convert currencies, because an exchange rate we choose
          would be a number we made up.
        </p>
      </Section>

      <Section id="limits" title="What the numbers do not tell you">
        <ul className="list-disc space-y-2 pl-5">
          <li>Network quality, speed and coverage. A cheaper plan can be slower or have fewer networks.</li>
          <li>Customer support and the refund process.</li>
          <li>Fair-use limits on unlimited plans, which apply after a daily amount of data.</li>
          <li>Taxes, payment fees, promo codes and prices that differ by country or at checkout.</li>
        </ul>
        <p>Always check the provider's page before you buy: prices change often.</p>
      </Section>

      <Section id="facts" title="Provider facts">
        <p>
          Facts such as hotspot rules, top-up options and refund terms come from each provider's own pages and are shown with a source
          link. When we could not verify a fact, the table says so instead of guessing.
        </p>
      </Section>

      <Section id="money" title="Independence and money">
        <p>
          No provider pays for placement. The ranking uses price only. Some outbound links are affiliate links, which means we may earn
          a commission if you buy; read the{" "}
          <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-stone-900">affiliate disclosure</Link>.
        </p>
      </Section>

      {CONTACT ? (
        <Section id="corrections" title="Corrections">
          <p>
            Spotted a wrong price or fact? Email{" "}
            <a href={`mailto:${CONTACT}`} className="underline underline-offset-2 hover:text-stone-900">{CONTACT}</a> and we will check it.
          </p>
        </Section>
      ) : null}
    </div>
  );
}
