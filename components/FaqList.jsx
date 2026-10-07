export default function FaqList({ faqs, heading = "Frequently asked questions" }) {
  if (!faqs?.length) return null;
  return (
    <section aria-labelledby="faq" className="mt-12">
      <h2 id="faq" className="text-2xl font-semibold text-balance text-stone-900">{heading}</h2>
      <dl className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
        {faqs.map((f) => (
          <div key={f.q} className="px-5 py-4">
            <dt className="font-semibold text-stone-900">{f.q}</dt>
            <dd className="mt-1 text-pretty text-stone-700">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
