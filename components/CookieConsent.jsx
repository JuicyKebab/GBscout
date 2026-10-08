"use client";

import { useEffect } from "react";
import * as CC from "vanilla-cookieconsent";

// Travelpayouts "Drive" affiliate script. Loaded on every page (TP verifies the
// script is present without a user gesture, so it cannot be consent-gated by us).
// Drive carries its own CMP (data-cmp-ab) that holds cookies until its consent,
// and it loads async after hydration so it stays off the critical path.
function loadDrive() {
  if (typeof document === "undefined" || document.getElementById("tp-drive")) return;
  const s = document.createElement("script");
  s.id = "tp-drive";
  s.async = true;
  s.setAttribute("data-cmp-ab", "2");
  s.src = "https://emrldco.com/NTgyODUy.js?t=582852";
  document.head.appendChild(s);
}

// Wire consent to Google Consent Mode v2. gtag is called only if present, so
// this is a no-op until GA is added, and starts gating analytics the moment it is.
function applyConsent() {
  const analytics = CC.acceptedCategory("analytics");
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: analytics ? "granted" : "denied",
    });
  }
}

const TR = {
  en: {
    consentModal: {
      title: "We use cookies",
      description:
        "GBScout uses strictly necessary cookies to function. With your consent we also set analytics cookies to improve the site. Our affiliate partner asks for its own cookie consent separately.",
      acceptAllBtn: "Accept all",
      acceptNecessaryBtn: "Necessary only",
      showPreferencesBtn: "Manage preferences",
      footer: '<a href="/privacy">Privacy policy</a>',
    },
    preferencesModal: {
      title: "Cookie preferences",
      acceptAllBtn: "Accept all",
      acceptNecessaryBtn: "Necessary only",
      savePreferencesBtn: "Save preferences",
      closeIconLabel: "Close",
      sections: [
        {
          title: "Cookie usage",
          description:
            "We use cookies to run the core site features and to improve your experience. Choose per category below.",
        },
        {
          title: "Strictly necessary",
          description:
            "Required for the site to work. Cannot be disabled.",
          linkedCategory: "necessary",
        },
        {
          title: "Analytics",
          description:
            "Helps us understand how the site is used so we can improve it.",
          linkedCategory: "analytics",
        },
        {
          title: "More information",
          description:
            'Questions about our cookies? Read the <a href="/privacy">privacy policy</a>.',
        },
      ],
    },
  },
};

export default function CookieConsent() {
  useEffect(() => {
    CC.run({
      guiOptions: {
        consentModal: { layout: "box", position: "bottom left" },
        preferencesModal: { layout: "box" },
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: {},
      },
      language: { default: "en", translations: TR },
      onFirstConsent: applyConsent,
      onConsent: applyConsent,
      onChange: applyConsent,
    });
    loadDrive();
  }, []);

  return (
    <button
      type="button"
      className="gbs-cc-revisit"
      aria-label="Cookie preferences"
      onClick={() => CC.showPreferences()}
    >
      Cookies
    </button>
  );
}
