import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/schema";

export const metadata = {
  title: "How to set up a travel eSIM (step by step)",
  description:
    "Which travel eSIM setup fits you, how to install one on iPhone, and the common traps: iMessage, 2FA texts, accidental roaming charges and fake unlimited plans.",
  alternates: { canonical: "/travel-esim-guide" },
};

const scenarios = [
  {
    goal: "I just want data, no calls or texts",
    do: "Use a travel eSIM for data and turn your home SIM off.",
    note: "The simplest, safest option when you only need internet.",
  },
  {
    goal: "I need to keep getting 2FA texts",
    do: "Travel eSIM for data, home SIM on with data roaming off.",
    note: "Incoming texts are usually free. Do not send texts or answer calls, which can trigger a paid roaming pass.",
  },
  {
    goal: "I want to avoid every carrier charge",
    do: "Disable your home SIM completely and use the travel eSIM only.",
    note: "No accidental roaming, international calls or travel-pass fees.",
  },
  {
    goal: "I need a local number for calls",
    do: "Get a local SIM or local eSIM instead.",
    note: "A travel eSIM is usually data-only. A local number matters for calls, reservations or deliveries.",
  },
  {
    goal: "I am worried about iMessage",
    do: "Keep your home SIM on with roaming off.",
    note: "iMessage needs your number active, or it falls back to your email address.",
  },
];

const steps = [
  { name: "Install the eSIM", text: "After you buy, you get a QR code by email. Scan it in your phone settings to add the eSIM. No SIM swap, no store visit, and you can do it before you fly." },
  { name: "Set data to the travel eSIM", text: "On iPhone: Settings, Cellular, Cellular Data, and pick the travel eSIM." },
  { name: "Turn off data switching", text: "Switch off Allow Cellular Data Switching, so your phone cannot fall back to your home SIM for data." },
  { name: "Fix roaming on both SIMs", text: "Home SIM: data roaming off. Travel eSIM: data roaming on, which it needs to work abroad." },
];

const faqs = [
  { q: "Will my carrier charge me if I use a travel eSIM?", a: "No. Your home carrier cannot charge you for data used on a separate travel eSIM. You only get charged if you actually use your home SIM abroad: outgoing and incoming calls and home-SIM data are charged, while incoming texts are usually free." },
  { q: "Can I keep my own number and use a travel eSIM?", a: "Yes. Most phones from the last few years are dual SIM: the travel eSIM carries mobile data while your home SIM keeps your number for calls and texts. Both can be active at once, and most phones can store several eSIMs and switch between them." },
  { q: "Why did my iMessage switch to my email address?", a: "Because your home SIM was turned off. iMessage needs your number active; with the SIM off it falls back to your email, which can start new threads and miss messages sent to your number. Fix it by turning the home SIM back on with roaming off, then check Settings, Messages, Send and Receive." },
  { q: "Do I need a phone number while traveling?", a: "Usually not. Most communication runs through apps like WhatsApp, Telegram, Messenger or WeChat over data, and businesses rarely call a foreign number. A local number only matters if you need calls, local reservations or deliveries." },
  { q: "Are unlimited travel eSIM plans really unlimited?", a: "Rarely. Most include a set amount of full-speed data before they slow down sharply, called a fair use policy. If a provider does not state the full-speed limit clearly, pick another one. For most travelers 5 to 10 GB a week is enough unless you stream a lot of video, hotspot often or work remotely." },
  { q: "I accidentally sent a text abroad. Will I be charged?", a: "Likely yes. Best case it is a single text charge; worst case it triggers your carrier's day-long travel pass. If you want zero risk, disable the home SIM completely." },
  { q: "What is the difference between an eSIM, a travel eSIM and a local eSIM?", a: "An eSIM is just a digital SIM, same function as a physical one. A travel eSIM is usually prepaid, short-term and data-only, often covering several countries. A local eSIM includes a phone number for calls and texts and may need registration." },
  { q: "What do I need for a travel eSIM to work?", a: "An unlocked, eSIM-capable phone (iPhone XS or newer, most Pixel and Galaxy from 2019 on). To keep your home number active at the same time you also need dual SIM, which those phones have." },
];

export default function TravelEsimGuide() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Travel eSIM guide", path: "/travel-esim-guide" },
  ];
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to set up a travel eSIM on iPhone",
    step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 text-3xl font-semibold text-balance text-stone-900 sm:text-4xl">How to set up a travel eSIM</h1>
      <p className="mt-4 text-lg text-pretty text-stone-800">
        A travel eSIM gives you data abroad without swapping your physical SIM. This guide covers which setup fits your
        trip, how to install one on iPhone, and the traps that catch people out: iMessage, 2FA texts, accidental roaming
        charges and plans that call themselves unlimited.
      </p>

      <section aria-labelledby="which" className="mt-10">
        <h2 id="which" className="text-2xl font-semibold text-balance text-stone-900">Which setup do you need?</h2>
        <div className="mt-4 space-y-3">
          {scenarios.map((s) => (
            <div key={s.goal} className="rounded-xl border border-stone-200 bg-white p-5">
              <p className="font-semibold text-stone-900">{s.goal}</p>
              <p className="mt-1 text-pretty text-teal-800">{s.do}</p>
              <p className="mt-1 text-sm text-pretty text-stone-600">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="setup" className="mt-12">
        <h2 id="setup" className="text-2xl font-semibold text-balance text-stone-900">Setting it up on iPhone</h2>
        <ol className="mt-4 space-y-3">
          {steps.map((s, i) => (
            <li key={s.name} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-5">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-teal-700 font-semibold text-white">{i + 1}</span>
              <div>
                <p className="font-semibold text-stone-900">{s.name}</p>
                <p className="mt-1 text-pretty text-stone-700">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-pretty text-stone-600">
          Android is the same idea: add the eSIM, set it as the data SIM, and turn roaming off on your home SIM but on for
          the travel eSIM. The menu names differ by phone.
        </p>
      </section>

      <section aria-labelledby="howmuch" className="mt-12">
        <h2 id="howmuch" className="text-2xl font-semibold text-balance text-stone-900">How much data do you need?</h2>
        <p className="mt-3 text-pretty text-stone-700">
          Be careful with unlimited plans: most slow down hard after a full-speed limit. For most trips 5 to 10 GB a week
          is plenty unless you stream a lot of video or hotspot often. Rather than guess, compare real plans by price per
          GB for your destination, so you only pay for what you will use.
        </p>
        <p className="mt-3">
          <Link href="/esim" className="font-medium text-teal-800 underline underline-offset-2 hover:text-stone-900">Compare eSIM prices by destination</Link>
          , or read the{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-stone-900">methodology</Link> for how {SITE.name} ranks plans.
        </p>
      </section>

      <FaqList faqs={faqs} heading="Common questions" />

      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd data={howToLd} />
      <JsonLd data={faqLd} />
    </div>
  );
}
