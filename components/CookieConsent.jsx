"use client";

import { useEffect } from "react";
import * as CC from "vanilla-cookieconsent";

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
        "GBScout uses strictly necessary cookies to function. With your consent we also set analytics cookies to improve the site.",
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
