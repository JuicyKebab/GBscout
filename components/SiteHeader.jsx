import Link from "next/link";
import { SITE } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="shrink-0 text-lg font-semibold text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
          {SITE.name}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-4 text-sm text-stone-600 sm:gap-5">
          <Link href="/#destinations" className="hidden hover:text-stone-900 sm:inline">Destinations</Link>
          <Link href="/#compare" className="hidden hover:text-stone-900 sm:inline">Compare</Link>
          <Link href="/methodology" className="hover:text-stone-900">Methodology</Link>
        </nav>
      </div>
    </header>
  );
}
