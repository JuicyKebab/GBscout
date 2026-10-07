import Link from "next/link";

export default function Breadcrumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((t, i) => (
          <li key={t.path} className="flex items-center gap-2">
            {i < trail.length - 1 ? (
              <Link href={t.path} className="hover:text-stone-900">{t.name}</Link>
            ) : (
              <span aria-current="page" className="text-stone-700">{t.name}</span>
            )}
            {i < trail.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
