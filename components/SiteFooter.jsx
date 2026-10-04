import Link from "next/link";
import { SITE } from "@/lib/site";
import { getPopular, validPairs, providersWithAlternatives } from "@/lib/data";
import { pairSlug, providerName } from "@/lib/providers";

export default function SiteFooter() {
  const destinations = getPopular(8).filter((d) => d.hasPage);
  const pairs = validPairs().slice(0, 6);
  const providers = providersWithAlternatives();
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm text-stone-600 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-semibold text-stone-900">{SITE.name}</p>
          <p className="mt-2 text-pretty">
            Independent eSIM price comparison. The ranking uses price only. Some links are affiliate links; see the{" "}
            <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-stone-900">affiliate disclosure</Link>.
          </p>
        </div>
        <div>
          <p className="font-semibold text-stone-900">Destinations</p>
          <ul className="mt-2 space-y-1">
            {destinations.map((d) => (
              <li key={d.slug}><Link href={`/esim/${d.slug}`} className="hover:text-stone-900">eSIM for {d.name}</Link></li>
            ))}
            <li><Link href="/esim" className="font-medium text-stone-900 hover:underline">All destinations →</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-stone-900">Compare</p>
          <ul className="mt-2 space-y-1">
            {pairs.map((p) => (
              <li key={pairSlug(p)}>
                <Link href={`/compare/${pairSlug(p)}`} className="hover:text-stone-900">{providerName(p[0])} vs {providerName(p[1])}</Link>
              </li>
            ))}
          </ul>
          {providers.length ? (
            <>
              <p className="mt-4 font-semibold text-stone-900">Providers</p>
              <ul className="mt-2 space-y-1">
                {providers.map((p) => (
                  <li key={p}><Link href={`/alternatives/${p}`} className="hover:text-stone-900">{providerName(p)} alternatives</Link></li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
        <div>
          <p className="font-semibold text-stone-900">About</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/methodology" className="hover:text-stone-900">Methodology</Link></li>
            <li><Link href="/affiliate-disclosure" className="hover:text-stone-900">Affiliate disclosure</Link></li>
            <li><Link href="/privacy" className="hover:text-stone-900">Privacy policy</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
