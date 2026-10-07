import { providerName } from "@/lib/providers";

// Evergreen, grotendeels data-afgeleide uitleg onder de prijstabellen. Doel: meer unieke,
// nuttige tekst per bestemming (anti-thin) zonder verzonnen claims. "Networks" komt 1-op-1
// uit data/plans.json (het network-veld per plan); de setup-stappen zijn universele eSIM-feiten.

/** Per provider de unieke netwerken die we in de plannen van deze bestemming zagen. */
function networksByProvider(offers) {
  const map = new Map();
  for (const r of offers.rows) {
    if (!r.network) continue;
    if (!map.has(r.provider)) map.set(r.provider, new Set());
    map.get(r.provider).add(r.network);
  }
  return [...map.entries()]
    .map(([provider, nets]) => ({ provider, networks: [...nets].sort() }))
    .sort((a, b) => providerName(a.provider).localeCompare(providerName(b.provider)));
}

export default function DestinationGuide({ offers, place }) {
  const nets = networksByProvider(offers);

  return (
    <section aria-labelledby="guide" className="mt-12 border-t border-stone-200 pt-10">
      <h2 id="guide" className="text-2xl font-semibold text-balance text-stone-900">
        Using an eSIM in {place}
      </h2>

      {nets.length ? (
        <div className="mt-5">
          <h3 className="text-lg font-semibold text-stone-900">Which networks you&rsquo;ll connect to</h3>
          <p className="mt-2 max-w-3xl text-pretty text-stone-700">
            An eSIM roams on a local mobile network, so coverage and speed depend on that carrier, not on the
            reseller. These are the networks each provider lists for {place}:
          </p>
          <ul className="mt-3 max-w-3xl space-y-1 text-stone-800">
            {nets.map((n) => (
              <li key={n.provider} className="tabular-nums">
                <span className="font-medium text-stone-900">{providerName(n.provider)}</span>
                {": "}
                {n.networks.join(", ")}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-stone-500">
            Network names come from each provider&rsquo;s own plan data. Price per GB says nothing about speed or
            coverage; the network does.
          </p>
        </div>
      ) : null}

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-stone-900">How to set up your eSIM before you go</h3>
        <ol className="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-pretty text-stone-800">
          <li>
            Check your phone is eSIM-capable and not carrier-locked. Most phones from 2019 on support eSIM; your
            settings or the manufacturer&rsquo;s list will confirm it.
          </li>
          <li>Buy the plan that fits your trip length and data need, then install the eSIM from the QR code or in-app link.</li>
          <li>
            Install it on home Wi-Fi before you leave for {place}. Activation often starts on first connection
            abroad, so read the provider&rsquo;s terms for when the clock begins.
          </li>
          <li>
            Keep your physical SIM for calls and texts if you need your home number; use the eSIM for data. Turn off
            data roaming on the home line to avoid charges.
          </li>
        </ol>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-stone-900">Which plan size to pick</h3>
        <p className="mt-2 max-w-3xl text-pretty text-stone-800">
          For a short city break, a small fixed-data plan is usually cheapest outright. For a longer stay or heavy
          use, compare on price per GB rather than the sticker price, since a larger plan often costs less per
          gigabyte. Unlimited plans only pay off when you cannot predict your usage and travel for a week or more,
          and they can slow down after a daily cap. The three cards above show the cheapest option for each of these
          cases for {place}.
        </p>
      </div>
    </section>
  );
}
