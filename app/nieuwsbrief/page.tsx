"use client";

import { FormEvent, useEffect, useState } from "react";

type Language = "nl" | "en";

const languageStorageKey = "cherelle-language";

export default function NewsletterPage() {
  const [language, setLanguage] = useState<Language>("nl");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "already" | "unsubscribed" | "invalid" | "error">("idle");

  useEffect(() => {
    const saved = window.localStorage.getItem(languageStorageKey);
    if (saved === "nl" || saved === "en") setLanguage(saved);

    const queryStatus = new URLSearchParams(window.location.search).get("status");
    if (queryStatus === "unsubscribed" || queryStatus === "invalid" || queryStatus === "error") {
      setStatus(queryStatus);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("sending");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: String(data.get("first_name") ?? ""),
          email: String(data.get("email") ?? ""),
          consent: data.get("consent") === "yes",
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Inschrijven is niet gelukt.");
      }

      form.reset();
      setStatus(result.already_subscribed ? "already" : "success");
    } catch {
      setStatus("error");
    }
  }

  const copy = language === "nl"
    ? {
        kicker: "Nieuwsbrief",
        title: "Af en toe iets zachts in je inbox.",
        body: "Schrijf je in voor nieuws, inzichten en uitnodigingen van Cherelle Elisa. Geen overvolle inbox. Je kunt je op ieder moment weer afmelden.",
        firstName: "Voornaam",
        email: "E-mailadres",
        consent: "Ja, ik wil de nieuwsbrief van Cherelle Elisa ontvangen en weet dat ik mij op ieder moment kan afmelden.",
        submit: "Schrijf mij in",
        sending: "Inschrijven…",
        success: "Je bent ingeschreven. Fijn dat je er bent.",
        already: "Dit e-mailadres staat al op de nieuwsbrieflijst.",
        unsubscribed: "Je bent afgemeld. Je ontvangt geen nieuwsbrieven meer.",
        invalid: "Deze afmeldlink is niet geldig.",
        error: "Er ging iets mis. Probeer het later opnieuw.",
        back: "Terug naar de website",
      }
    : {
        kicker: "Newsletter",
        title: "Something gentle in your inbox, every now and then.",
        body: "Subscribe for news, insights and invitations from Cherelle Elisa. No crowded inbox. You can unsubscribe at any time.",
        firstName: "First name",
        email: "Email address",
        consent: "Yes, I want to receive the Cherelle Elisa newsletter and I know I can unsubscribe at any time.",
        submit: "Subscribe",
        sending: "Subscribing…",
        success: "You’re subscribed. Lovely to have you here.",
        already: "This email address is already subscribed.",
        unsubscribed: "You’re unsubscribed. You will no longer receive newsletters.",
        invalid: "This unsubscribe link is not valid.",
        error: "Something went wrong. Please try again later.",
        back: "Back to the website",
      };

  return (
    <main className="newsletterPage">
      <header className="newsletterPageHeader">
        <a href="/">CHERELLE ELISA</a>
        <div>
          <button type="button" className={language === "nl" ? "isActive" : ""} onClick={() => setLanguage("nl")} aria-label="Nederlands">🇳🇱</button>
          <button type="button" className={language === "en" ? "isActive" : ""} onClick={() => setLanguage("en")} aria-label="English">🇬🇧</button>
        </div>
      </header>

      <section className="newsletterPageInner">
        <div className="newsletterPageIntro">
          <p className="detailKicker">{copy.kicker}</p>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
        </div>

        {status === "unsubscribed" || status === "invalid" ? (
          <div className="newsletterPageResult">
            <strong>{status === "unsubscribed" ? "✓" : "—"}</strong>
            <p>{status === "unsubscribed" ? copy.unsubscribed : copy.invalid}</p>
            <a href="/">{copy.back} →</a>
          </div>
        ) : (
          <form className="newsletterSignupForm" onSubmit={submit}>
            <label>
              <span>{copy.firstName}</span>
              <input name="first_name" autoComplete="given-name" />
            </label>

            <label>
              <span>{copy.email}</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>

            <label className="newsletterConsent">
              <input name="consent" type="checkbox" value="yes" required />
              <span>{copy.consent}</span>
            </label>

            <button type="submit" disabled={status === "sending"}>
              {status === "sending" ? copy.sending : copy.submit} <span aria-hidden="true">→</span>
            </button>

            {status === "success" && <p className="newsletterFormSuccess">{copy.success}</p>}
            {status === "already" && <p className="newsletterFormSuccess">{copy.already}</p>}
            {status === "error" && <p className="newsletterFormError">{copy.error}</p>}
          </form>
        )}
      </section>
    </main>
  );
}
