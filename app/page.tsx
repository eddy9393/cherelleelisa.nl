"use client";

import Image from "next/image";
import { Fragment, FormEvent, useEffect, useState } from "react";
import {
  CmsContentMap,
  CmsMedia,
  CmsReview,
  DEFAULT_HOMEPAGE_CONTENT,
  contentValue,
  loadPublicCms,
} from "../lib/cherelleCms";

const instagramUrl = "https://www.instagram.com/cherelle_elisa_/";
const contactEmail = "info@cherelleelisa.nl";
const accessCode = "Cher2026!";
const accessStorageKey = "cherelle-preview-access";
const languageStorageKey = "cherelle-language";

const menuItems = [
  { id: "home" },
  { id: "herkenning" },
  { id: "mogelijkheden" },
  { id: "begeleiding" },
  { id: "werkwijze" },
  { id: "ervaringen" },
  { id: "over-mij" },
  { id: "uitnodiging" },
] as const;

type Language = "nl" | "en";

const menuLabels: Record<Language, Record<MenuItemId, string>> = {
  nl: {
    home: "Home",
    herkenning: "Herkenning",
    mogelijkheden: "Thuiskomen",
    begeleiding: "Begeleiding",
    werkwijze: "Werkwijze",
    "over-mij": "Over mij",
    ervaringen: "Ervaringen",
    uitnodiging: "Uitnodiging",
  },
  en: {
    home: "Home",
    herkenning: "Recognition",
    mogelijkheden: "Coming home",
    begeleiding: "Guidance",
    werkwijze: "Approach",
    "over-mij": "About me",
    ervaringen: "Experiences",
    uitnodiging: "Invitation",
  },
};

type MenuItemId = (typeof menuItems)[number]["id"];

function AnimatedHeroLine({
  text,
  offset = 0,
  className = "",
}: {
  text: string;
  offset?: number;
  className?: string;
}) {
  return (
    <span
      className={`siteHeroLine heroLineReveal ${className}`.trim()}
      aria-hidden="true"
      style={{ animationDelay: `${320 + offset * 430}ms` }}
    >
      {text}
    </span>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.4" cy="6.7" r="1" fill="currentColor" />
    </svg>
  );
}

function PhotoPlaceholder({
  note,
  className = "",
}: {
  note: string;
  className?: string;
}) {
  return (
    <div className={`photoPlaceholder ${className}`.trim()} role="img" aria-label={note}>
      <span>Foto volgt</span>
    </div>
  );
}

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [hasError, setHasError] = useState(false);
  const [activeItem, setActiveItem] = useState<MenuItemId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("nl");
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [cmsContent, setCmsContent] = useState<CmsContentMap>({ ...DEFAULT_HOMEPAGE_CONTENT });
  const [cmsReviews, setCmsReviews] = useState<CmsReview[]>([]);
  const [cmsMedia, setCmsMedia] = useState<Record<string, CmsMedia>>({});

  useEffect(() => {
    setIsUnlocked(window.localStorage.getItem(accessStorageKey) === "unlocked");
    const savedLanguage = window.localStorage.getItem(languageStorageKey);
    if (savedLanguage === "en" || savedLanguage === "nl") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let active = true;
    void loadPublicCms().then((data) => {
      if (!active) return;
      setCmsContent(data.content);
      setCmsReviews(data.reviews);
      setCmsMedia(data.media);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateHeader = () => setHeaderScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;

    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("isRevealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 80}ms`);
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, [isUnlocked]);

  const copy = (key: string) => contentValue(cmsContent, key, language);
  const mediaSrc = (slot: string, fallback: string) => cmsMedia[slot]?.public_url || fallback;
  const mediaAlt = (slot: string, fallback: string) => {
    const item = cmsMedia[slot];
    if (!item) return fallback;
    return (language === "nl" ? item.alt_nl : item.alt_en) || fallback;
  };

  function handleAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (code === accessCode) {
      window.localStorage.setItem(accessStorageKey, "unlocked");
      setIsUnlocked(true);
      setCode("");
      setHasError(false);
      return;
    }

    setHasError(true);
  }

  function goToSection(id: MenuItemId) {
    setActiveItem(id);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function LanguageSwitcher() {
    return (
      <div className="languageSwitcher" aria-label={language === "nl" ? "Taal kiezen" : "Choose language"}>
        <button
          type="button"
          className={language === "nl" ? "languageFlag isActive" : "languageFlag"}
          onClick={() => setLanguage("nl")}
          aria-label="Nederlands"
          aria-pressed={language === "nl"}
        >
          NL
        </button>
        <span className="languageDivider" aria-hidden="true">/</span>
        <button
          type="button"
          className={language === "en" ? "languageFlag isActive" : "languageFlag"}
          onClick={() => setLanguage("en")}
          aria-label="English"
          aria-pressed={language === "en"}
        >
          EN
        </button>
      </div>
    );
  }

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const phone = String(form.get("phone") ?? "");
    const interest = String(form.get("interest") ?? "");
    const message = String(form.get("message") ?? "");

    const subject = encodeURIComponent(
      language === "nl"
        ? `Kennismaking via cherelleelisa.nl — ${interest || "algemene vraag"}`
        : `Introduction via cherelleelisa.nl — ${interest || "general question"}`
    );
    const body = encodeURIComponent(
      [
        language === "nl" ? `Naam: ${name}` : `Name: ${name}`,
        `E-mail: ${email}`,
        phone ? (language === "nl" ? `Telefoon: ${phone}` : `Phone: ${phone}`) : "",
        language === "nl" ? `Interesse: ${interest}` : `Interest: ${interest}`,
        "",
        language === "nl"
          ? "Waar ik nu sta / waar ik naar verlang:"
          : "Where I am now / what I long for:",
        message,
      ]
        .filter(Boolean)
        .join("\n")
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <main className={isUnlocked ? "siteRoot" : "siteRoot siteRootLocked"}>
      {isUnlocked && (
        <header className={`previewHeader desktopPersistentHeader ${headerScrolled ? "isScrolled" : ""}`}>
          <a
            className="previewBrand"
            href="/"
            onClick={() => {
              setActiveItem(null);
              setMenuOpen(false);
            }}
          >
            CHERELLE ELISA
          </a>

          <nav className="previewNav" aria-label="Hoofdnavigatie">
            {menuItems.map((item) => {
              const href =
                item.id === "home" ? "/" :
                item.id === "herkenning" ? "/herkenning" :
                item.id === "mogelijkheden" ? "/thuiskomen" :
                item.id === "begeleiding" ? "/begeleiding" :
                item.id === "werkwijze" ? "/werkwijze" :
                item.id === "over-mij" ? "/over-mij" :
                item.id === "ervaringen" ? "/#ervaringen" :
                "/#uitnodiging";

              return (
                <a
                  key={item.id}
                  className="previewNavItem"
                  href={href}
                  onClick={() => setMenuOpen(false)}
                >
                  {menuLabels[language][item.id]}
                </a>
              );
            })}
          </nav>
          <LanguageSwitcher />
        </header>
      )}

      {isUnlocked && (
        <header className={`mobileSiteHeader ${menuOpen ? "menuOpen" : ""}`}>
          <a
            className="previewBrand"
            href="/"
            onClick={() => {
              setActiveItem(null);
              setMenuOpen(false);
            }}
          >
            CHERELLE ELISA
          </a>

          <LanguageSwitcher />

          <button
            className="mobileMenuButton"
            type="button"
            aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>

          <nav className="previewNav" aria-label="Hoofdnavigatie">
            {menuItems.map((item) => {
              const href =
                item.id === "home" ? "/" :
                item.id === "herkenning" ? "/herkenning" :
                item.id === "mogelijkheden" ? "/thuiskomen" :
                item.id === "begeleiding" ? "/begeleiding" :
                item.id === "werkwijze" ? "/werkwijze" :
                item.id === "over-mij" ? "/over-mij" :
                item.id === "ervaringen" ? "/#ervaringen" :
                "/#uitnodiging";

              return (
                <a
                  key={item.id}
                  className="previewNavItem"
                  href={href}
                  onClick={() => setMenuOpen(false)}
                >
                  {menuLabels[language][item.id]}
                </a>
              );
            })}
          </nav>
        </header>
      )}

      <section id="top" className={`hero ${isUnlocked ? "heroUnlocked" : "heroLocked"}`}>
        <Image
          className={isUnlocked ? "heroBackdrop heroBackdropDesktopNew" : "heroBackdrop"}
          src={mediaSrc("hero", "/HeroCherelle.webp")}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          quality={82}
        />
        {isUnlocked && (
          <Image
            className="heroBackdrop heroBackdropMobileOld"
            src={mediaSrc("hero", "/HeroCherelle.webp")}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            quality={82}
          />
        )}
        <div className="heroVeil" aria-hidden="true" />

        {isUnlocked ? (
          <>
            <section className="siteHeroContent" aria-labelledby="site-hero-title">
              <h1
                id="site-hero-title"
                className="siteHeroTitle"
                aria-label={
                  language === "nl"
                    ? "Je bent al zo lang sterk geweest. Maar ben je ook zacht geweest voor jezelf?"
                    : "You have been strong for so long. But have you also been gentle with yourself?"
                }
              >
                <span className="desktopHeroTitle desktopHeroTitleReference">
                  <AnimatedHeroLine
                    text={language === "nl" ? "Je bent al zo lang" : "You have been strong"}
                    offset={1}
                  />
                  <AnimatedHeroLine
                    text={language === "nl" ? "sterk geweest." : "for so long."}
                    offset={2}
                  />
                  <span className="heroReferenceGap" aria-hidden="true" />
                  <AnimatedHeroLine
                    text={language === "nl" ? "Maar ben je ook" : "But have you also been"}
                    offset={3}
                  />
                  <span
                    className="siteHeroLine heroAccentLine heroLineReveal"
                    aria-hidden="true"
                    style={{ animationDelay: "2040ms" }}
                  >
                    <span className="heroAccentWord">
                      {language === "nl" ? "Zacht" : "Gentle"}
                    </span>
                    <span className="heroAccentTail">
                      {language === "nl" ? "geweest" : ""}
                    </span>
                  </span>
                  <AnimatedHeroLine
                    text={language === "nl" ? "voor jezelf?" : "with yourself?"}
                    offset={5}
                  />
                </span>

                <span className="mobileHeroTitle" aria-hidden="true">
                  <span className="mobileHeroSentence">
                    {language === "nl" ? "Je bent al zo lang sterk geweest." : "You have been strong for so long."}
                  </span>
                  <span className="mobileHeroSentence mobileHeroSentenceSecond">
                    {language === "nl"
                      ? "Maar ben je ook Zacht geweest voor jezelf?"
                      : "But have you also been gentle with yourself?"}
                  </span>
                </span>
              </h1>

              <p className="siteHeroSubtitle">{copy("hero_subtitle")}</p>

              <a className="feminineWayButton" href="#herkenning">
                <span>{copy("hero_cta")}</span>
                <span aria-hidden="true">→</span>
              </a>
            </section>
          </>
        ) : (
          <div className="accessArea">
            <form className="accessForm" onSubmit={handleAccess}>
              <label className="srOnly" htmlFor="preview-code">
                {language === "nl" ? "Toegangscode" : "Access code"}
              </label>
              <input
                id="preview-code"
                className="accessInput"
                type="text"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (hasError) setHasError(false);
                }}
                placeholder={language === "nl" ? "Toegangscode" : "Access code"}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={hasError}
              />
              <button
                className="accessButton"
                type="submit"
                aria-label={language === "nl" ? "Website bekijken" : "View website"}
              >
                →
              </button>
            </form>
            {hasError && (
              <p className="accessError">
                {language === "nl" ? "Onjuiste code" : "Incorrect code"}
              </p>
            )}
          </div>
        )}

        {!isUnlocked && (
          <section className="heroContent" aria-labelledby="coming-soon-title">
            <p className="eyebrow">CHERELLE ELISA</p>
            <h1 id="coming-soon-title">Coming Soon.</h1>
            <p className="intro">
              {language === "nl"
                ? "Neem nu alvast een kijkje op mijn Instagram voor meer info."
                : "Take a look at my Instagram for more information."}
            </p>
            <a
              className="instagramLink"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={language === "nl" ? "Bekijk Cherelle Elisa op Instagram" : "View Cherelle Elisa on Instagram"}
            >
              <span className="instagramIcon"><InstagramIcon /></span>
            </a>
          </section>
        )}
      </section>

      {isUnlocked && (
        <>
          <section className="cherelleQuoteBar" aria-label={language === "nl" ? "Quote van Cherelle" : "Quote by Cherelle"}>
            <p>{copy("quote_bar")}</p>
            <span>— Cherelle Elisa</span>
          </section>

          <section id="herkenning" className="contentSection recognitionSection">
            <div className="sectionCopy recognitionCopy" data-reveal>
              <p className="sectionKicker">{copy("recognition_kicker")}</p>
              <h2>{copy("recognition_title")}</h2>
              <p>{copy("recognition_body")}</p>
              <p className="sectionEmphasis">{copy("recognition_emphasis")}</p>
              <a className="sectionLink sectionPageLink" href="/herkenning">
                {copy("recognition_cta")} <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="recognitionImageWrap" data-reveal>
              <Image
                src={mediaSrc("recognition", "/Herkenning.jpg")}
                alt={mediaAlt("recognition", "Cherelle in een rustig moment")}
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
                quality={82}
                className="recognitionImage"
              />
            </div>
          </section>

          <section id="mogelijkheden" className="possibilitySection">
            <div className="possibilityImageWrap" data-reveal>
              <Image
                src={mediaSrc("homecoming", "/Thuiskomen.jpg")}
                alt={mediaAlt("homecoming", "Cherelle tijdens een moment van rust en verbinding")}
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
                quality={82}
                className="possibilityImage"
              />
            </div>

            <div className="sectionCopy possibilityCopy" data-reveal>
              <p className="sectionKicker">{copy("homecoming_kicker")}</p>
              <h2>{copy("homecoming_title")}</h2>
              <p>{copy("homecoming_body")}</p>
              <p className="sectionManifesto">
                {copy("homecoming_manifesto").split("\n").map((line, index, lines) => (
                  <Fragment key={`${line}-${index}`}>
                    {line}
                    {index < lines.length - 1 && <br />}
                  </Fragment>
                ))}
              </p>
              <a className="sectionLink sectionPageLink" href="/thuiskomen">
                {copy("homecoming_cta")} <span aria-hidden="true">→</span>
              </a>
            </div>
          </section>

          <section id="begeleiding" className="offersSection">
            <div className="offersIntro" data-reveal>
              <p className="sectionKicker">{copy("guidance_kicker")}</p>
              <h2>{copy("guidance_title")}</h2>
            </div>

            <div className="mobileSwipeHint" aria-hidden="true">
              <span>←</span>
              <span>{language === "nl" ? "Veeg voor meer" : "Swipe for more"}</span>
              <span>→</span>
            </div>

            <div className="offerList">
              <article className="offerRow" data-reveal>
                <div className="offerText">
                  <span className="offerNumber">01</span>
                  <h3>{copy("guidance_1_title")}</h3>
                  <p>{copy("guidance_1_body")}</p>
                  <a className="sectionLink" href="/begeleiding#the-feminine-way">
                    {copy("guidance_1_cta")} <span aria-hidden="true">→</span>
                  </a>
                </div>
                <div className="offerImageWrap">
                  <Image
                    src={mediaSrc("guidance_feminine", "/feminine.jpg")}
                    alt="The Feminine Way"
                    fill
                    sizes="(max-width: 900px) 100vw, 31vw"
                    quality={82}
                    className="offerImage"
                    onError={(event) => {
                      event.currentTarget.style.opacity = "0";
                    }}
                  />
                </div>
              </article>

              <article className="offerRow" data-reveal>
                <div className="offerText">
                  <span className="offerNumber">02</span>
                  <h3>{copy("guidance_2_title")}</h3>
                  <p>{copy("guidance_2_body")}</p>
                  <a className="sectionLink" href="/begeleiding#een-op-een">
                    {copy("guidance_2_cta")} <span aria-hidden="true">→</span>
                  </a>
                </div>
                <div className="offerImageWrap">
                  <Image
                    src={mediaSrc("guidance_1to1", "/1-op-1.jpg")}
                    alt="1-op-1 sessie met Cherelle"
                    fill
                    sizes="(max-width: 900px) 100vw, 31vw"
                    quality={82}
                    className="offerImage"
                    onError={(event) => {
                      event.currentTarget.style.opacity = "0";
                    }}
                  />
                </div>
              </article>

              <article className="offerRow" data-reveal>
                <div className="offerText">
                  <span className="offerNumber">03</span>
                  <h3>{copy("guidance_3_title")}</h3>
                  <p>{copy("guidance_3_body")}</p>
                  <a className="sectionLink" href="/begeleiding#ceremonies">
                    {copy("guidance_3_cta")} <span aria-hidden="true">→</span>
                  </a>
                </div>
                <div className="offerImageWrap">
                  <Image
                    src={mediaSrc("guidance_ceremonies", "/ceremonies.jpg")}
                    alt="Ceremonie voor vrouwen"
                    fill
                    sizes="(max-width: 900px) 100vw, 31vw"
                    quality={82}
                    className="offerImage"
                    onError={(event) => {
                      event.currentTarget.style.opacity = "0";
                    }}
                  />
                </div>
              </article>
            </div>
          </section>

          <section id="werkwijze" className="methodSection methodSectionEditorial">
            <div className="methodEditorialVisual" data-reveal>
              <div className="methodEditorialImageWrap">
                <Image
                  src={mediaSrc("approach", "/Werkwijze.png")}
                  alt={mediaAlt("approach", language === "nl" ? "Cherelle in een warme, natuurlijke omgeving" : "Cherelle in a warm, natural setting")}
                  width={1365}
                  height={2048}
                  sizes="(max-width: 900px) 100vw, 46vw"
                  quality={88}
                  className="methodEditorialImage"
                />
                <div className="methodEditorialImageFade" aria-hidden="true" />
              </div>
            </div>

            <div className="methodEditorialCopy" data-reveal>
              <p className="sectionKicker">{copy("approach_kicker")}</p>

              <div className="methodEditorialText">
                <p className="methodLead methodLeadPrimary">{copy("approach_body")}</p>

                <p className="methodLead methodLeadSecondary">{copy("approach_emphasis")}</p>

                <p className="methodNote">{copy("approach_note")}</p>

                <a className="sectionLink methodPageLink" href="/werkwijze">
                  {copy("approach_cta")} <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </section>

          <section id="ervaringen" className="testimonialsSection">
            <div className="testimonialsHeading" data-reveal>
              <p className="sectionKicker">{copy("reviews_kicker")}</p>
              <h2>{copy("reviews_title")}</h2>
            </div>

            <div className="testimonialsGrid" aria-label="Ruimte voor ervaringen">
              {(cmsReviews.length > 0 ? cmsReviews : [1, 2, 3]).map((item, index) => {
                if (typeof item === "number") {
                  return (
                    <article className="testimonialSlot" key={item} data-reveal>
                      <span>{language === "nl" ? `Ervaring 0${item}` : `Experience 0${item}`}</span>
                      <p>
                        {language === "nl"
                          ? "Ruimte voor haar ervaring, in haar eigen woorden."
                          : "Space for her experience, in her own words."}
                      </p>
                    </article>
                  );
                }

                const role = language === "nl" ? item.role_nl : item.role_en;
                const quote = language === "nl" ? item.quote_nl : item.quote_en;
                return (
                  <article className="testimonialSlot" key={item.id} data-reveal>
                    <span>{role || item.name || `0${index + 1}`}</span>
                    <p>“{quote || item.quote_nl}”</p>
                    <small className="testimonialName">{item.name}</small>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="over-mij" className="contentSection sectionSplit aboutSection">
            <div className="aboutImageWrap" data-reveal>
              <Image
                src={mediaSrc("about", "/Overmij.webp")}
                alt={mediaAlt("about", "Cherelle ontspannen op een lichte loungebank")}
                fill
                sizes="(max-width: 1000px) 100vw, 48vw"
                quality={82}
                className="aboutImage"
              />
              <span className="aboutImageAccent">Cherelle</span>
            </div>
            <div className="sectionCopy" data-reveal>
              <p className="sectionKicker">{copy("about_kicker")}</p>
              <h2>{copy("about_title")}</h2>
              <p>{copy("about_body_1")}</p>
              <p>{copy("about_body_2")}</p>
              <a className="sectionLink sectionLinkLarge" href="/over-mij">
                {copy("about_cta")} <span aria-hidden="true">→</span>
              </a>
            </div>
          </section>

          <section id="uitnodiging" className="invitationSection">
            <div className="invitationImageWrap" data-reveal>
              <Image
                src={mediaSrc("invitation", "/Uitnodiging.webp")}
                alt={mediaAlt("invitation", language === "nl" ? "Cherelle in een warm en uitnodigend moment" : "Cherelle in a warm and inviting moment")}
                fill
                sizes="(max-width: 1000px) 100vw, 48vw"
                quality={82}
                className="invitationImage"
              />
            </div>

            <div className="invitationCopy" data-reveal>
              <p className="sectionKicker">{copy("invitation_kicker")}</p>
              <h2>{copy("invitation_title")}</h2>
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
                      <option value="1-op-1 sessie">{language === "nl" ? "1-op-1 sessie" : "1-to-1 session"}</option>
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

                <div className="contactFormFooter">
                  <button className="contactSubmit" type="submit">
                    {language === "nl" ? "Stuur mijn bericht" : "Send my message"}{" "}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            </div>
          </section>

          <footer className="siteFooter">
            <div className="footerBrand" data-reveal>
              <a href="/">CHERELLE ELISA</a>
              <p>{language === "nl" ? "Een zachtere weg naar jezelf." : "A gentler way back to yourself."}</p>
            </div>

            <nav className="footerNav" aria-label="Footer navigatie" data-reveal>
              {menuItems.map((item) => {
                const href =
                  item.id === "home" ? "/" :
                  item.id === "herkenning" ? "/herkenning" :
                  item.id === "mogelijkheden" ? "/thuiskomen" :
                  item.id === "begeleiding" ? "/begeleiding" :
                  item.id === "werkwijze" ? "/werkwijze" :
                  item.id === "over-mij" ? "/over-mij" :
                  item.id === "ervaringen" ? "/#ervaringen" :
                  "/#uitnodiging";

                return (
                  <a key={item.id} href={href}>
                    {menuLabels[language][item.id]}
                  </a>
                );
              })}
            </nav>

            <div className="footerMeta" data-reveal>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              <a
                className="footerInstagram"
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <span>© 2026 Cherelle Elisa</span>
            </div>
          </footer>
        </>
      )}
    </main>
  );
}
