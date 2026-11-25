"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import AccountLink from "../components/AccountLink";
import {
  CmsContentMap,
  CmsMedia,
  DEFAULT_HOMEPAGE_CONTENT,
  contentValue,
  loadPublicCms,
} from "../../lib/cherelleCms";

type Language = "nl" | "en";

const languageStorageKey = "cherelle-language";

const navItems = [
  { href: "/", nl: "Home", en: "Home" },
  { href: "/herkenning", nl: "Herkenning", en: "Recognition" },
  { href: "/thuiskomen", nl: "Thuiskomen", en: "Coming home" },
  { href: "/begeleiding", nl: "Begeleiding", en: "Guidance" },
  { href: "/werkwijze", nl: "Werkwijze", en: "Approach" },
  { href: "/ervaringen", nl: "Ervaringen", en: "Experiences" },
  { href: "/over-mij", nl: "Over mij", en: "About me" },
  { href: "/uitnodiging", nl: "Uitnodiging", en: "Invitation" },
];

export default function UitnodigingPage() {
  const [language, setLanguage] = useState<Language>("nl");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cmsContent, setCmsContent] = useState<CmsContentMap>({ ...DEFAULT_HOMEPAGE_CONTENT });
  const [cmsMedia, setCmsMedia] = useState<Record<string, CmsMedia>>({});
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    const saved = window.localStorage.getItem(languageStorageKey);
    if (saved === "nl" || saved === "en") setLanguage(saved);

    let active = true;
    void loadPublicCms().then((data) => {
      if (!active) return;
      setCmsContent(data.content);
      setCmsMedia(data.media);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  const copy = (key: string) => contentValue(cmsContent, key, language);
  const invitationImage = cmsMedia.invitation?.public_url || "/Uitnodiging.webp";
  const invitationAlt =
    (language === "nl" ? cmsMedia.invitation?.alt_nl : cmsMedia.invitation?.alt_en) ||
    (language === "nl"
      ? "Cherelle in een warm en uitnodigend moment"
      : "Cherelle in a warm and inviting moment");

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (contactStatus === "sending") return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      interest: String(form.get("interest") ?? ""),
      message: String(form.get("message") ?? ""),
      privacy_acknowledged: form.get("privacy_acknowledged") === "yes",
      language,
    };

    setContactStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Send failed");
      }

      formElement.reset();
      setContactStatus("success");
    } catch {
      setContactStatus("error");
    }
  }

  return (
    <main className="invitationPage">
      <header className={`detailHeader ${menuOpen ? "menuOpen" : ""}`}>
        <a className="detailBrand" href="/" onClick={() => setMenuOpen(false)}>
          CHERELLE ELISA
        </a>

        <nav className="detailNav" aria-label={language === "nl" ? "Hoofdnavigatie" : "Main navigation"}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item[language]}
            </a>
          ))}
        </nav>

        <div className="detailUtilities">
          <div className="detailLanguage" aria-label={language === "nl" ? "Taal kiezen" : "Choose language"}>
            <button
              type="button"
              className={language === "nl" ? "isActive" : ""}
              onClick={() => setLanguage("nl")}
              aria-label="Nederlands"
            >
              🇳🇱
            </button>
            <button
              type="button"
              className={language === "en" ? "isActive" : ""}
              onClick={() => setLanguage("en")}
              aria-label="English"
            >
              🇬🇧
            </button>
          </div>
          <AccountLink label={language === "nl" ? "Inloggen" : "Log in"} />
        </div>

        <button
          className="detailMenuButton"
          type="button"
          aria-label={menuOpen ? (language === "nl" ? "Menu sluiten" : "Close menu") : (language === "nl" ? "Menu openen" : "Open menu")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </header>

      <section className="invitationSection invitationPageSection">
        <div className="invitationImageWrap">
          <Image
            src={invitationImage}
            alt={invitationAlt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 46vw"
            quality={84}
            className="invitationImage"
            unoptimized={invitationImage.startsWith("http")}
          />
        </div>

        <div className="invitationCopy">
          <p className="sectionKicker">{copy("invitation_kicker")}</p>
          <h1>{copy("invitation_title")}</h1>
          <p>{copy("invitation_body")}</p>

          <form className="contactForm" onSubmit={handleContactSubmit}>
            <div className="contactFormRow">
              <label>
                <span>{language === "nl" ? "Naam" : "Name"}</span>
                <input type="text" name="name" autoComplete="name" required />
              </label>
              <label>
                <span>E-mail</span>
                <input type="email" name="email" autoComplete="email" required />
              </label>
            </div>

            <div className="contactFormRow">
              <label>
                <span>
                  {language === "nl" ? "Telefoon" : "Phone"}{" "}
                  <small>{language === "nl" ? "optioneel" : "optional"}</small>
                </span>
                <input type="tel" name="phone" autoComplete="tel" />
              </label>
              <label>
                <span>{language === "nl" ? "Waar heb je interesse in?" : "What are you interested in?"}</span>
                <select name="interest" defaultValue="Kennismaken" required>
                  <option value="Kennismaken">
                    {language === "nl" ? "Eerst even kennismaken" : "An introductory conversation"}
                  </option>
                  <option value="The Feminine Way">The Feminine Way</option>
                  <option value="1-op-1 sessie">
                    {language === "nl" ? "1-op-1 sessie" : "1-to-1 session"}
                  </option>
                  <option value="Ceremonies">Ceremonies</option>
                </select>
              </label>
            </div>

            <label className="contactMessage">
              <span>
                {language === "nl"
                  ? "Waar sta je nu, en waar verlang je naar?"
                  : "Where are you now, and what do you long for?"}
              </span>
              <textarea name="message" rows={5} required />
            </label>

            <label className="legalConsentCheck contactLegalConsent">
              <input name="privacy_acknowledged" type="checkbox" value="yes" required />
              <span>
                {language === "nl" ? (
                  <>Ik heb kennisgenomen van de <a href="/privacyverklaring" target="_blank" rel="noreferrer">privacyverklaring</a> en begrijp hoe mijn gegevens voor deze aanvraag worden verwerkt.</>
                ) : (
                  <>I have read the <a href="/privacyverklaring" target="_blank" rel="noreferrer">privacy policy</a> and understand how my data is processed for this request.</>
                )}
              </span>
            </label>

            <div className="contactFormFooter">
              <button
                className="contactSubmit"
                type="submit"
                disabled={contactStatus === "sending"}
              >
                {contactStatus === "sending"
                  ? (language === "nl" ? "Versturen…" : "Sending…")
                  : (language === "nl" ? "Stuur mijn bericht" : "Send my message")}{" "}
                <span aria-hidden="true">→</span>
              </button>

              {contactStatus === "success" && (
                <p className="contactFeedback contactFeedbackSuccess" role="status">
                  {language === "nl"
                    ? "Dankjewel. Je aanmelding is verstuurd."
                    : "Thank you. Your request has been sent."}
                </p>
              )}

              {contactStatus === "error" && (
                <p className="contactFeedback contactFeedbackError" role="alert">
                  {language === "nl"
                    ? "Versturen is niet gelukt. Probeer het opnieuw of mail naar info@cherelleelisa.nl."
                    : "Sending failed. Please try again or email info@cherelleelisa.nl."}
                </p>
              )}
            </div>
          </form>
        </div>
      </section>

      <footer className="detailFooter">
        <a href="/">CHERELLE ELISA</a>
        <div className="detailFooterLinks">
          <a href="/nieuwsbrief">{language === "nl" ? "Nieuwsbrief" : "Newsletter"}</a>
          <a href="/privacyverklaring">{language === "nl" ? "Privacyverklaring" : "Privacy policy"}</a>
          <a href="/algemene-voorwaarden">{language === "nl" ? "Algemene voorwaarden" : "Terms & conditions"}</a>
          <a href="mailto:info@cherelleelisa.nl">info@cherelleelisa.nl</a>
        </div>
      </footer>
    </main>
  );
}
