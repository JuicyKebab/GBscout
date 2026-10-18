import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Terms of use",
  description: `The terms for using ${SITE.name}.`,
  alternates: { canonical: "/terms" },
};

const UPDATED = "18 October 2026";

function Section({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-2xl font-semibold text-balance text-stone-900">{title}</h2>
      <div className="mt-3 space-y-3 text-pretty text-stone-700">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Terms of use", path: "/terms" },
  ];
  const { operatorName, contactEmail } = SITE;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">Terms of use</h1>
      <p className="mt-2 text-sm text-stone-500">Last updated {UPDATED}.</p>
      <p className="mt-4 text-lg text-pretty text-stone-800">
        These terms govern your use of {SITE.name}. By using the site you accept them. If you do not agree, please do not use the site.
      </p>

      <Section id="what" title="What this site is">
        <p>
          {SITE.name} is a free, independent comparison site for eSIM data plans. We rank plans by price and link you to the
          provider that sells them. We are not an eSIM provider, we do not sell plans, and we are not party to any purchase you
          make. Your contract is always with the provider you buy from.
        </p>
      </Section>

      <Section id="accuracy" title="Accuracy and availability">
        <p>
          We show prices and plan details gathered from providers and update them regularly, but we cannot guarantee they are
          complete, current or error-free. Prices, data allowances and terms change at the provider, and the price you see at
          checkout is the one that applies. Always confirm the details on the provider&apos;s own site before you buy. The site is
          provided &quot;as is&quot; and may be unavailable or change at any time.
        </p>
      </Section>

      <Section id="affiliate" title="Affiliate links">
        <p>
          Some links are affiliate links: if you buy after clicking, we may earn a commission at no extra cost to you. This never
          changes how we rank plans; we rank on price only. See the{" "}
          <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-stone-900">affiliate disclosure</Link>.
        </p>
      </Section>

      <Section id="use" title="Acceptable use">
        <p>
          You may use the site for your own, lawful, personal use. You may not scrape, copy or republish the site&apos;s content at
          scale, interfere with its operation, or use it in any way that breaks the law or infringes our rights or those of others.
        </p>
      </Section>

      <Section id="ip" title="Content and intellectual property">
        <p>
          The site&apos;s design, text and compiled data belong to {operatorName || "the operator of this site"} unless stated
          otherwise. Provider names and logos belong to their respective owners and are used only to identify the plans compared.
        </p>
      </Section>

      <Section id="liability" title="Liability">
        <p>
          We provide information to help you choose, not advice. To the extent the law allows, we are not liable for any loss arising
          from your use of the site or from a decision you make based on it, including an eSIM that does not work as you expected.
          Nothing here limits liability that cannot be limited by law.
        </p>
      </Section>

      <Section id="changes" title="Changes">
        <p>
          We may update these terms. The current version always appears here with the date above. Continuing to use the site after a
          change means you accept the updated terms.
        </p>
      </Section>

      <Section id="law" title="Governing law">
        <p>
          These terms are governed by Belgian law, and any dispute falls under the courts competent for the operator&apos;s seat,
          without affecting any mandatory rights you have as a consumer where you live.
        </p>
      </Section>

      {contactEmail ? (
        <Section id="contact" title="Contact">
          <p>
            Questions about these terms? Email{" "}
            <a href={`mailto:${contactEmail}`} className="underline underline-offset-2 hover:text-stone-900">{contactEmail}</a>.
          </p>
        </Section>
      ) : null}
    </div>
  );
}
