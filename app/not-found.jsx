import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="text-3xl font-semibold text-balance text-stone-900">Page not found</h1>
      <p className="mt-3 text-pretty text-stone-700">
        This page does not exist, or we do not have verified prices for it yet.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Find an eSIM by destination
      </Link>
    </div>
  );
}
