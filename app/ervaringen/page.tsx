"use client";

import { useEffect, useState } from "react";
import AccountLink from "../components/AccountLink";
import { CmsReview, loadPublicCms } from "../../lib/cherelleCms";

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
  { href: "/#uitnodiging", nl: "Uitnodiging", en: "Invitation" },
];

export default function ExperiencesPage() {
  const [language, setLanguage] = useState<Language>("nl");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<CmsReview[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(languageStorageKey);
    if (saved === "nl" || saved === "en") setLanguage(saved);

    let active = true;
    void loadPublicCms().then((data) => {
      if (active) setReviews(data.reviews);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <main className="detailPage experiencesPage">
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
            <button type="button" className={language === "nl" ? "isActive" : ""} onClick={() => setLanguage("nl")} aria-label="Nederlands">
              🇳🇱
            </button>
            <button type="button" className={language === "en" ? "isActive" : ""} onClick={() => setLanguage("en")} aria-label="English">
              🇬🇧
            </button>
          </div>
          <AccountLink label={language === "nl" ? "Inloggen" : "Log in"} />
        </div>

        <button
          className="detailMenuButton"
          type="button"
          aria-label={
            menuOpen
              ? language === "nl"
                ? "Menu sluiten"
                : "Close menu"
              : language === "nl"
                ? "Menu openen"
                : "Open menu"
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </header>

      <section className="experiencesHero">
        <div className="experiencesHeroInner">
          <p className="detailKicker">{language === "nl" ? "Ervaringen" : "Experiences"}</p>
          <h1>{language === "nl" ? "In hun eigen woorden." : "In their own words."}</h1>
          <p>
            {language === "nl"
              ? "Geen groot verhaal eromheen. Hier lees je wat vrouwen zelf delen over hun ervaring."
              : "No big story around it. Here you can read what women themselves share about their experience."}
          </p>
        </div>
        <span className="experiencesHeroAccent" aria-hidden="true">
          {language === "nl" ? "voelen" : "feel"}
        </span>
      </section>

      <section className="experiencesContent">
        <div className="experiencesIntro">
          <p className="detailKicker">{language === "nl" ? "Wat vrouwen zeggen" : "What women say"}</p>
          <h2>
            {language === "nl"
              ? "Persoonlijk, verschillend en precies zoals zij het hebben ervaren."
              : "Personal, different and exactly as they experienced it."}
          </h2>
        </div>

        {reviews.length > 0 ? (
          <div className="experiencesGrid">
            {reviews.map((review, index) => {
              const role = language === "nl" ? review.role_nl : review.role_en;
              const quote = language === "nl" ? review.quote_nl : review.quote_en;

              return (
                <article
                  className={`experienceCard ${index === 0 ? "experienceCardFeatured" : ""}`}
                  key={review.id}
                >
                  <span className="experienceNumber">{String(index + 1).padStart(2, "0")}</span>
                  <blockquote>“{quote || review.quote_nl}”</blockquote>
                  <footer className="experienceAuthor">
                    {review.image_url && (
                      <img className="experienceAuthorPhoto" src={review.image_url} alt={review.name} />
                    )}
                    <div>
                      <strong>{review.name}</strong>
                      {role ? <span>{role}</span> : null}
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="experiencesEmpty">
            <p>
              {language === "nl"
                ? "Binnenkort verschijnen hier persoonlijke ervaringen."
                : "Personal experiences will appear here soon."}
            </p>
          </div>
        )}
      </section>

      <section className="experiencesClosing">
        <p className="detailKicker">{language === "nl" ? "Jouw eigen tempo" : "Your own pace"}</p>
        <h2>
          {language === "nl"
            ? "Benieuwd wat er voor jou passend voelt?"
            : "Curious what might feel right for you?"}
        </h2>
        <p>
          {language === "nl"
            ? "Je hoeft nog niets te beslissen. Een kennismaking is er om samen te kijken wat bij jou en jouw moment past."
            : "You do not need to decide anything yet. An introductory conversation is there to explore what fits you and where you are right now."}
        </p>
        <a className="detailCta" href="/#uitnodiging">
          {language === "nl" ? "Plan een kennismaking" : "Plan an introduction"} <span aria-hidden="true">→</span>
        </a>
      </section>

      <footer className="detailFooter">
        <a href="/">CHERELLE ELISA</a>
        <a href="/#uitnodiging">{language === "nl" ? "Contact" : "Contact"}</a>
      </footer>
    </main>
  );
}
