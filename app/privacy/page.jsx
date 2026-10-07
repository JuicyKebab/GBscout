import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Privacy policy",
  description: `What ${SITE.name} does and does not do with your data.`,
  alternates: { canonical: "/privacy" },
};

// Zet hier de datum van de laatste inhoudelijke wijziging. Voeg je analytics of cookies toe,
// pas dan ook de tekst hieronder aan: de zinnen "geen cookies" en "geen analytics" gelden nu.
const UPDATED = "3 October 2026";

function Section({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-2xl font-semibold text-balance text-stone-900">{title}</h2>
      <div className="mt-3 space-y-3 text-pretty text-stone-700">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Privacy policy", path: "/privacy" },
  ];
  const { operatorName, operatorAddress, contactEmail } = SITE;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">Privacy policy</h1>
      <p className="mt-2 text-sm text-stone-500">Last updated {UPDATED}.</p>
      <p className="mt-4 text-lg text-pretty text-stone-800">
        {SITE.name} is a price comparison site. It has no accounts, no forms and no newsletter. This page explains what little
        data is involved and who handles it.
      </p>

      {operatorName || operatorAddress || contactEmail ? (
        <Section id="who" title={operatorName || operatorAddress ? "Who is responsible" : "Contact"}>
          <p>
            {operatorName ? <strong className="font-semibold text-stone-900">{operatorName}</strong> : null}
            {operatorName && operatorAddress ? `, ${operatorAddress}` : operatorAddress}
            {operatorName || operatorAddress ? " is responsible for this site. " : null}
            {contactEmail ? (
              <>
                {operatorName || operatorAddress ? "You can reach us at " : "For questions or requests about this site or this policy, email "}
                <a href={`mailto:${contactEmail}`} className="underline underline-offset-2 hover:text-stone-900">{contactEmail}</a>.
              </>
            ) : null}
          </p>
        </Section>
      ) : null}

      <Section id="collect" title="What we collect">
        <p>
          We do not ask you for any personal data, and the site sets no cookies and runs no analytics or advertising trackers. Because
          there is no analytics, we do not see which pages you read.
        </p>
        <p>
          Like every website, the site is delivered by a hosting provider. Its servers record standard technical data when a page is
          requested: your IP address, the page requested, the time, and your browser type. The hosting provider keeps these server
          logs to deliver the site and keep it secure, under its own retention rules.
        </p>
      </Section>

      <Section id="links" title="Links to providers">
        <p>
          The plan links on this site lead to the eSIM providers' own websites. Once you click, you leave this site and the provider
          handles your data under its own privacy policy. Some links are affiliate links: they pass through an affiliate network that
          can set its own cookies to credit us for a sale. The link carries a tag with the name of the page you came from, such as
          "esim-japan". It does not carry any information about you.
        </p>
        <p>
          Read the <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-stone-900">affiliate disclosure</Link> for how
          this affects the site.
        </p>
      </Section>

      {contactEmail ? (
        <Section id="email" title="If you email us">
          <p>
            If you write to {contactEmail}, we use your email address and message only to reply to you and to fix errors you report.
            We keep the conversation as long as needed to deal with it. The legal basis is our legitimate interest in answering
            questions about the site.
          </p>
        </Section>
      ) : null}

      <Section id="rights" title="Your rights">
        <p>
          Under the GDPR you can ask for access to data about you, ask for it to be corrected or erased, and object to its use. Because we
          hold almost no data about visitors, there is usually little to give, but you can ask
          {contactEmail ? "" : " the person responsible for this site"}. You can also complain to your national data
          protection authority. In Belgium that is the Gegevensbeschermingsautoriteit (Autorite de protection des donnees).
        </p>
      </Section>

      <Section id="changes" title="Changes">
        <p>
          If this changes, for example if we add analytics or a newsletter, we update this page and the date at the top before the
          change goes live.
        </p>
      </Section>
    </div>
  );
}
