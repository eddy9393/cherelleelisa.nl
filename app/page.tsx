"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

const instagramUrl = "https://www.instagram.com/cherelle_elisa_/";
const contactEmail = "info@cherelleelisa.nl";
const accessCode = "Cher2026!";
const accessStorageKey = "cherelle-preview-access";
const languageStorageKey = "cherelle-language";

const menuItems = [
  { id: "herkenning" },
  { id: "mogelijkheden" },
  { id: "begeleiding" },
  { id: "werkwijze" },
  { id: "over-mij" },
  { id: "ervaringen" },
  { id: "uitnodiging" },
] as const;

type Language = "nl" | "en";

const menuLabels: Record<Language, Record<MenuItemId, string>> = {
  nl: {
    herkenning: "Herkenning",
    mogelijkheden: "Thuiskomen",
    begeleiding: "Begeleiding",
    werkwijze: "Werkwijze",
    "over-mij": "Over mij",
    ervaringen: "Ervaringen",
    uitnodiging: "Uitnodiging",
  },
  en: {
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
    <span className={`siteHeroLine ${className}`.trim()} aria-hidden="true">
      {Array.from(text).map((character, index) => {
        const shuffledStep =
          ((index * 17 + offset * 11) % 37) + ((index * 7 + offset) % 5) * 37;
        const delay = 120 + shuffledStep * 9;

        return (
          <span
            className="heroLetter"
            key={`${offset}-${index}`}
            style={{ animationDelay: `${delay}ms` }}
          >
            {character === " " ? "\u00A0" : character}
          </span>
        );
      })}
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
  const [coordinateMode, setCoordinateMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [language, setLanguage] = useState<Language>("nl");
  const [headerScrolled, setHeaderScrolled] = useState(false);

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
    const updateHeader = () => setHeaderScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!coordinateMode) return;

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [coordinateMode]);

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
        <>
          <button
            className={coordinateMode ? "coordinateAdminButton isActive" : "coordinateAdminButton"}
            type="button"
            onClick={() => setCoordinateMode((enabled) => !enabled)}
            aria-pressed={coordinateMode}
            title="Toon muiscoördinaten"
          >
            XY
          </button>

          {coordinateMode && (
            <div
              className="coordinateReadout"
              style={{
                left: Math.min(mousePosition.x + 18, window.innerWidth - 122),
                top: Math.min(mousePosition.y + 18, window.innerHeight - 54),
              }}
              aria-hidden="true"
            >
              <span>X {mousePosition.x}</span>
              <span>Y {mousePosition.y}</span>
            </div>
          )}
        </>
      )}

      {isUnlocked && (
        <header className={`previewHeader desktopPersistentHeader ${headerScrolled ? "isScrolled" : ""}`}>
          <a
            className="previewBrand"
            href="#top"
            onClick={() => {
              setActiveItem(null);
              setMenuOpen(false);
            }}
          >
            CHERELLE ELISA
          </a>

          <nav className="previewNav" aria-label="Hoofdnavigatie">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={activeItem === item.id ? "previewNavItem isActive" : "previewNavItem"}
                type="button"
                aria-current={activeItem === item.id ? "page" : undefined}
                onClick={() => goToSection(item.id)}
              >
                {menuLabels[language][item.id]}
              </button>
            ))}
          </nav>
          <LanguageSwitcher />
        </header>
      )}

      <section id="top" className={`hero ${isUnlocked ? "heroUnlocked" : "heroLocked"}`}>
        <Image
          className={isUnlocked ? "heroBackdrop heroBackdropDesktopNew" : "heroBackdrop"}
          src={isUnlocked ? "/CherHero.png" : "/HeroCherelle.webp"}
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
            src="/HeroCherelle.webp"
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
            <header className={`previewHeader mobileHeroHeader ${menuOpen ? "menuOpen" : ""} ${headerScrolled ? "isScrolled" : ""}`}>
              <a
                className="previewBrand"
                href="#top"
                onClick={() => {
                  setActiveItem(null);
                  setMenuOpen(false);
                }}
              >
                CHERELLE ELISA
              </a>

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
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    className={activeItem === item.id ? "previewNavItem isActive" : "previewNavItem"}
                    type="button"
                    aria-current={activeItem === item.id ? "page" : undefined}
                    onClick={() => goToSection(item.id)}
                  >
                    {menuLabels[language][item.id]}
                  </button>
                ))}
              </nav>
              <LanguageSwitcher />
            </header>

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
                  <span className="siteHeroLine heroAccentLine" aria-hidden="true">
                    <span className="heroAccentWord">
                      {language === "nl" ? "Zacht" : "Gentle"}
                    </span>
                    <span className="heroAccentTail">
                      {language === "nl" ? "geweest" : ""}
                    </span>
                  </span>
                  <AnimatedHeroLine
                    text={language === "nl" ? "voor jezelf?" : "with yourself?"}
                    offset={4}
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

              <p className="siteHeroSubtitle">
                {language === "nl"
                  ? "Voor de vrouw die alles draagt en zichzelf onderweg is kwijtgeraakt."
                  : "For the woman who carries everything and lost herself along the way."}
              </p>

              <a className="feminineWayButton" href="#herkenning">
                <span>{language === "nl" ? "Herkenbaar?" : "Recognize this?"}</span>
                <svg
                  className="feminineWayArrow"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                >
                  <path
                    d="M12 4V19M7 14L12 19L17 14"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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

          <section id="herkenning" className="contentSection recognitionSection">
            <div className="heroRecognitionTransition" aria-hidden="true">
              <Image
                src="/overgang1.png"
                alt=""
                fill
                sizes="110vw"
                className="heroRecognitionTransitionImage"
              />
            </div>

            <div className="sectionCopy recognitionCopy" data-reveal>
              <p className="sectionKicker">{language === "nl" ? "Herkenning" : "Recognition"}</p>
              <h2>{language === "nl" ? "Herken je dit?" : "Does this feel familiar?"}</h2>
              <p>
                {language === "nl"
                  ? "Je staat altijd klaar, voor je werk, je gezin en iedereen om je heen. ’s Avonds lig je in bed en je hoofd blijft maar doorgaan. Je bent moe, al zo lang dat je bijna vergeten bent hoe het anders voelde. Van buiten ziet je leven er goed uit, en toch vraag je je soms af waarom jij dat geluk niet voelt."
                  : "You are always there for your work, your family and everyone around you. At night you lie in bed while your mind keeps going. You are tired, for so long that you have almost forgotten what it felt like to feel different. From the outside your life looks good, yet sometimes you wonder why you do not feel that happiness."}
              </p>
              <p className="sectionEmphasis">
                {language === "nl"
                  ? "Er is niets mis met je. Je hebt alleen heel lang gezocht op een plek waar het niet te vinden is."
                  : "There is nothing wrong with you. You have simply been searching for a long time in a place where it cannot be found."}
              </p>
            </div>
            <div className="recognitionImageWrap" data-reveal>
              <Image
                src="/Herkenning.jpg"
                alt="Cherelle in een rustig moment"
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
                src="/Thuiskomen.jpg"
                alt="Cherelle tijdens een moment van rust en verbinding"
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
                quality={82}
                className="possibilityImage"
              />
            </div>

            <div className="sectionCopy possibilityCopy" data-reveal>
              <p className="sectionKicker">{language === "nl" ? "Wat er mogelijk is" : "What becomes possible"}</p>
              <h2>{language === "nl" ? "Thuiskomen in je lichaam" : "Coming home to your body"}</h2>
              <p>
                {language === "nl"
                  ? "Stel je voor dat je weer voelt wat je nodig hebt, en daar ook naar durft te handelen. Dat je nee kunt zeggen zonder schuldgevoel en hulp kunt aannemen zonder dat het ongemakkelijk voelt. Dat je rust neemt omdat je moe bent, en dat er weer ruimte is voor plezier, sensualiteit en vrijheid."
                  : "Imagine feeling what you need again, and daring to act on it. Saying no without guilt and accepting help without discomfort. Resting because you are tired, while making space again for pleasure, sensuality and freedom."}
              </p>
              <p className="sectionManifesto">
                {language === "nl" ? (
                  <>
                    Van hoofd naar hart.<br />
                    Van doen naar zijn.<br />
                    Van controle naar overgave.
                  </>
                ) : (
                  <>
                    From head to heart.<br />
                    From doing to being.<br />
                    From control to surrender.
                  </>
                )}
              </p>
            </div>
          </section>

          <section id="begeleiding" className="offersSection">
            <div className="offersIntro" data-reveal>
              <p className="sectionKicker">{language === "nl" ? "Zo kan ik je begeleiden" : "How I can support you"}</p>
              <h2>{language === "nl" ? "Een vorm die past bij waar jij nu bent." : "A form of support that meets you where you are."}</h2>
            </div>

            <div className="offerList">
              <article className="offerRow" data-reveal>
                <div className="offerText">
                  <span className="offerNumber">01</span>
                  <h3>The Feminine Way</h3>
                  <p>
                    {language === "nl"
                      ? "Een persoonlijk traject van zes maanden waarin je stap voor stap terugkomt in je lichaam en weer leert leven vanuit je vrouwelijke energie. Volledig afgestemd op jou en in jouw tempo. Veel vrouwen merken dat ze na dit traject rustiger zijn, beter voelen wat ze nodig hebben en weer kunnen ontvangen."
                      : "A personal six-month journey in which you gradually return to your body and learn to live from your feminine energy again. Fully tailored to you and at your pace. Many women notice they feel calmer, sense what they need more clearly and are able to receive again."}
                  </p>
                  <button className="sectionLink" type="button">
                    {language === "nl" ? "Lees meer" : "Read more"} <span aria-hidden="true">→</span>
                  </button>
                </div>
                <div className="offerImageWrap">
                  <Image
                    src="/feminine.jpg"
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
                  <h3>1-op-1 sessie</h3>
                  <p>
                    {language === "nl"
                      ? "Een sessie van ongeveer anderhalf uur waarin we samen werken met wat er op dat moment in jou leeft. Ook mogelijk samen met je partner, vriendin of moeder."
                      : "A session of around ninety minutes in which we work together with whatever is alive in you at that moment. Also possible together with your partner, a friend or your mother."}
                  </p>
                  <button className="sectionLink" type="button">
                    {language === "nl" ? "Bekijk sessies" : "View sessions"} <span aria-hidden="true">→</span>
                  </button>
                </div>
                <div className="offerImageWrap">
                  <Image
                    src="/1-op-1.jpg"
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
                  <h3>Ceremonies</h3>
                  <p>
                    {language === "nl"
                      ? "Samen met andere vrouwen ruimte maken om te voelen, los te laten en te verbinden."
                      : "Creating space with other women to feel, let go and connect."}
                  </p>
                  <button className="sectionLink" type="button">
                    {language === "nl" ? "Bekijk ceremonies" : "View ceremonies"} <span aria-hidden="true">→</span>
                  </button>
                </div>
                <div className="offerImageWrap">
                  <Image
                    src="/ceremonies.jpg"
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

          <section id="werkwijze" className="methodSection">
            <div className="methodImageLayer" aria-hidden="true">
              <Image
                src="/Werkwijze.webp"
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 62vw"
                quality={82}
                className="methodBackgroundImage"
              />
              <div className="methodImageFade" />
            </div>

            <div className="methodInner" data-reveal>
              <p className="sectionKicker">{language === "nl" ? "Mijn manier van werken" : "My approach"}</p>
              <div className="methodColumns">
                <p className="methodLead methodLeadPrimary">
                  {language === "nl"
                    ? "We werken altijd in jouw tempo. Soms raken we diepe lagen aan, zoals oude patronen of wat je van thuis hebt meegekregen. Daar ga ik zorgvuldig mee om, zodat het veilig voelt en je niets hoeft te forceren."
                    : "We always work at your pace. Sometimes we touch deeper layers, such as old patterns or things you learned at home. I approach those carefully, so it feels safe and nothing needs to be forced."}
                </p>
                <div className="methodSide">
                  <p className="methodLead methodLeadSecondary">
                    {language === "nl"
                      ? "Jij bepaalt waar je naartoe wilt, ik loop met je mee en hou je vast als het spannend wordt."
                      : "You decide where you want to go. I walk beside you and support you when it feels vulnerable."}
                  </p>
                  <p className="methodNote">
                    {language === "nl"
                      ? "Mijn begeleiding is geen vervanging van therapie of medische zorg. Twijfel je of dit bij je past? Dan bespreken we dat gewoon samen."
                      : "My guidance is not a replacement for therapy or medical care. Unsure whether this is right for you? We can simply discuss that together."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="over-mij" className="contentSection sectionSplit aboutSection">
            <div className="aboutImageWrap" data-reveal>
              <Image
                src="/Overmij.webp"
                alt="Cherelle ontspannen op een lichte loungebank"
                fill
                sizes="(max-width: 1000px) 100vw, 48vw"
                quality={82}
                className="aboutImage"
              />
              <span className="aboutImageAccent">Cherelle</span>
            </div>
            <div className="sectionCopy" data-reveal>
              <p className="sectionKicker">{language === "nl" ? "Over mij" : "About me"}</p>
              <h2>{language === "nl" ? "Ik ben Cherelle" : "I’m Cherelle"}</h2>
              <p>
                {language === "nl"
                  ? "Ik ken dit van binnenuit. Jarenlang deed ik alles goed: harder werken, meer leren, er altijd voor anderen zijn. En toch bleef het van binnen leeg. Op een reis naar Egypte voelde ik voor het eerst hoe het is om gewoon te zijn, vrij en in het moment."
                  : "I know this from the inside. For years I did everything right: working harder, learning more and always being there for others. Yet inside it still felt empty. During a journey to Egypt I felt for the first time what it is like to simply be, free and present."}
              </p>
              <p>
                {language === "nl"
                  ? "Sindsdien begeleid ik vrouwen terug naar zichzelf. Inmiddels zijn dat er zo’n 500, en organiseerde ik ongeveer 15 ceremonies."
                  : "Since then I have guided women back to themselves. By now that is around 500 women, and I have organised about 15 ceremonies."}
              </p>
              <button className="sectionLink sectionLinkLarge" type="button">
                {language === "nl" ? "Lees mijn verhaal" : "Read my story"} <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>

          <section id="ervaringen" className="testimonialsSection">
            <div className="testimonialsHeading" data-reveal>
              <p className="sectionKicker">{language === "nl" ? "Ervaringen" : "Experiences"}</p>
              <h2>{language === "nl" ? "Wat vrouwen zeggen" : "What women say"}</h2>
            </div>

            <div className="testimonialsGrid" aria-label="Ruimte voor ervaringen">
              {[1, 2, 3].map((item) => (
                <article className="testimonialSlot" key={item} data-reveal>
                  <span>{language === "nl" ? `Ervaring 0${item}` : `Experience 0${item}`}</span>
                  <p>
                    {language === "nl"
                      ? "Ruimte voor haar ervaring, in haar eigen woorden."
                      : "Space for her experience, in her own words."}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section id="uitnodiging" className="invitationSection">
            <div className="invitationImageWrap" data-reveal>
              <Image
                src="/Uitnodiging.webp"
                alt={language === "nl" ? "Cherelle in een warm en uitnodigend moment" : "Cherelle in a warm and inviting moment"}
                fill
                sizes="(max-width: 1000px) 100vw, 48vw"
                quality={82}
                className="invitationImage"
              />
            </div>

            <div className="invitationCopy" data-reveal>
              <p className="sectionKicker">{language === "nl" ? "Uitnodiging" : "Invitation"}</p>
              <h2>{language === "nl" ? "Voel je dat het tijd is?" : "Do you feel it is time?"}</h2>
              <p>
                {language === "nl"
                  ? "Plan een vrijblijvend kennismakingsgesprek. We kijken samen waar je nu staat en wat bij je past. Je mag ook gewoon een berichtje sturen."
                  : "Plan a no-obligation introductory conversation. Together we will look at where you are now and what suits you. You are also welcome to simply send a message."}
              </p>

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
              <a href="#top">CHERELLE ELISA</a>
              <p>{language === "nl" ? "Een zachtere weg naar jezelf." : "A gentler way back to yourself."}</p>
            </div>

            <nav className="footerNav" aria-label="Footer navigatie" data-reveal>
              {menuItems.map((item) => (
                <a key={item.id} href={`#${item.id}`}>
                  {menuLabels[language][item.id]}
                </a>
              ))}
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
