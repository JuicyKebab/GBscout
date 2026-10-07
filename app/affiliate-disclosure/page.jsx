import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Affiliate disclosure",
  description: "Some links on this site are affiliate links. How that works and why it does not change the ranking.",
  alternates: { canonical: "/affiliate-disclosure" },
};

export default function AffiliateDisclosurePage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Affiliate disclosure", path: "/affiliate-disclosure" },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">Affiliate disclosure</h1>
      <div className="mt-6 space-y-4 text-pretty text-stone-700">
        <p>
          {SITE.name} is free to use. Some links on this site are affiliate links: if you buy a plan after clicking one, the provider may pay us
          a commission. It does not cost you anything extra.
        </p>
        <p>
          The ranking uses price only. No provider pays for placement, and whether a provider has an affiliate program does not
          change where its plans appear. Affiliate links are marked with <code className="rounded bg-stone-100 px-1 text-sm">rel="sponsored"</code>.
        </p>
        <p>
          Commissions pay for running the site. They do not hide the cheaper options: the tables list every data-only plan we
          checked, ranked by price per GB, whether or not we earn from it.
        </p>
        <p>
          How we collect and rank prices is explained in the{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-stone-900">methodology</Link>.
        </p>
      </div>
    </div>
  );
}
