"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DestinationSearch({ destinations }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const q = query.trim().toLowerCase();
  const matches = q ? destinations.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 6) : [];

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (matches[0]) router.push(`/esim/${matches[0].slug}`);
      }}
      className="relative max-w-xl"
    >
      <label htmlFor="destination" className="sr-only">Destination</label>
      <input
        id="destination"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Where are you going? e.g. Japan"
        autoComplete="off"
        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      />
      {q ? (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-md">
          {matches.length ? (
            matches.map((d) => (
              <li key={d.slug}>
                <Link href={`/esim/${d.slug}`} className="flex items-center justify-between px-4 py-3 text-stone-900 hover:bg-stone-50">
                  <span>{d.name}</span>
                  {d.soon ? <span className="text-xs text-stone-500">prices coming soon</span> : null}
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-stone-600">No destination matches "{query}".</li>
          )}
        </ul>
      ) : null}
    </form>
  );
}
