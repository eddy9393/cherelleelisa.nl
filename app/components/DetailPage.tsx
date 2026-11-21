"use client";

import Image from "next/image";
import AccountLink from "./AccountLink";
import { ReactNode, useEffect, useState } from "react";
import {
  CmsContentMap,
  CmsMedia,
  DEFAULT_HOMEPAGE_CONTENT,
  contentValue,
  loadPublicCms,
} from "../../lib/cherelleCms";

type Language = "nl" | "en";
type DetailKey = "herkenning" | "thuiskomen" | "begeleiding" | "werkwijze" | "over-mij";

const languageStorageKey = "cherelle-language";

const navItems = [
  { href: "/", nl: "Home", en: "Home" },
  { href: "/herkenning", nl: "Herkenning", en: "Recognition" },
  { href: "/thuiskomen", nl: "Thuiskomen", en: "Coming home" },
  { href: "/begeleiding", nl: "Begeleiding", en: "Guidance" },
  { href: "/werkwijze", nl: "Werkwijze", en: "Approach" },
  { href: "/over-mij", nl: "Over mij", en: "About me" },
  { href: "/ervaringen", nl: "Ervaringen", en: "Experiences" },
  { href: "/uitnodiging", nl: "Uitnodiging", en: "Invitation" },
];

const pageConfig: Record<DetailKey, {
  prefix: string;
  mediaSlot: string;
  fallbackImage: string;
  nextHref: string;
}> = {
  herkenning: {
    prefix: "detail_recognition",
    mediaSlot: "detail_recognition_hero",
    fallbackImage: "/Herkenning.jpg",
    nextHref: "/thuiskomen",
  },
  thuiskomen: {
    prefix: "detail_homecoming",
    mediaSlot: "detail_homecoming_hero",
    fallbackImage: "/Thuiskomen.jpg",
    nextHref: "/begeleiding",
  },
  begeleiding: {
    prefix: "detail_guidance",
    mediaSlot: "detail_guidance_hero",
    fallbackImage: "/feminine.jpg",
    nextHref: "/uitnodiging",
  },
  werkwijze: {
    prefix: "detail_approach",
    mediaSlot: "detail_approach_hero",
    fallbackImage: "/Werkwijze.png",
    nextHref: "/begeleiding",
  },
  "over-mij": {
    prefix: "detail_about",
    mediaSlot: "detail_about_hero",
    fallbackImage: "/Overmij.webp",
    nextHref: "/uitnodiging",
  },
};

function SectionShell({
  kicker,
  title,
  children,
  className = "",
}: {
  kicker?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`detailEditorialSection ${className}`.trim()}>
      <div className="detailEditorialHeading">
        {kicker ? <p className="detailKicker">{kicker}</p> : null}
        <h2>{title}</h2>
      </div>
      <div className="detailEditorialBody">{children}</div>
    </section>
  );
}

function DetailWave({ from, to }: { from: string; to: string }) {
  return (
    <div
      className="detailSectionWave"
      style={{ backgroundColor: from, color: to }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,42 C170,108 325,18 520,58 C710,98 865,162 1080,118 C1245,84 1345,42 1440,70 L1440,180 L0,180 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

function Paragraphs({ value, className = "" }: { value: string; className?: string }) {
  const paragraphs = value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
    </div>
  );
}

function HerkenningBody({ t }: { t: (key: string) => string }) {
  return (
    <>
      <SectionShell
        kicker={t("detail_recognition_section_kicker")}
        title={t("detail_recognition_section_title")}
      >
        <div className="detailLongform">
          <Paragraphs value={t("detail_recognition_body")} />
          <p className="detailEmphasis">{t("detail_recognition_emphasis")}</p>
        </div>
      </SectionShell>

      <DetailWave from="#f8f4ef" to="#f1e7dc" />

      <SectionShell
        kicker={t("detail_recognition_transitions_kicker")}
        title={t("detail_recognition_transitions_title")}
        className="detailTransitionsSection"
      >
        <div className="detailTransitions">
          {Array.from({ length: 7 }, (_, index) => {
            const value = t(`detail_recognition_transition_${index + 1}`);
            return (
              <article key={index}>
                <span>0{index + 1}</span>
                <p>{value}</p>
              </article>
            );
          })}
        </div>
      </SectionShell>
    </>
  );
}

function ThuiskomenBody({ t }: { t: (key: string) => string }) {
  return (
    <>
      <SectionShell
        kicker={t("detail_homecoming_section_kicker")}
        title={t("detail_homecoming_section_title")}
      >
        <Paragraphs value={t("detail_homecoming_body")} className="detailLongform" />
      </SectionShell>

      <DetailWave from="#f8f4ef" to="#f5eee7" />

      <SectionShell
        kicker={t("detail_homecoming_story_kicker")}
        title={t("detail_homecoming_story_title")}
        className="detailStorySection"
      >
        <div className="detailStory">
          <Paragraphs value={t("detail_homecoming_story_body")} />
          <blockquote>{t("detail_homecoming_story_quote")}</blockquote>
        </div>
      </SectionShell>
    </>
  );
}

function BegeleidingBody({ t }: { t: (key: string) => string }) {
  const services = [
    {
      id: "een-op-een",
      index: "01",
      script: t("detail_guidance_1_script"),
      title: t("detail_guidance_1_title"),
      body: t("detail_guidance_1_body"),
      meta: t("detail_guidance_1_meta"),
    },
    {
      id: "the-feminine-way",
      index: "02",
      script: t("detail_guidance_2_script"),
      title: t("detail_guidance_2_title"),
      body: t("detail_guidance_2_body"),
      mantra: t("detail_guidance_2_mantra"),
      words: [
        t("detail_guidance_2_word_1"),
        t("detail_guidance_2_word_2"),
        t("detail_guidance_2_word_3"),
        t("detail_guidance_2_word_4"),
      ],
    },
    {
      id: "retreats",
      index: "03",
      script: t("detail_guidance_3_script"),
      title: t("detail_guidance_3_title"),
      body: t("detail_guidance_3_body"),
      meta: t("detail_guidance_3_meta"),
    },
    {
      id: "ceremonies",
      index: "04",
      script: t("detail_guidance_4_script"),
      title: t("detail_guidance_4_title"),
      body: "",
    },
  ];

  return (
    <section className="detailServicesSection">
      <div className="detailEditorialHeading">
        <p className="detailKicker">{t("detail_guidance_section_kicker")}</p>
        <h2>{t("detail_guidance_section_title")}</h2>
      </div>

      <div className="detailServiceStack">
        {services.map((service, index) => (
          <article
            className={`detailServiceCard ${index === 3 ? "detailServiceCardMinimal" : ""}`.trim()}
            id={service.id}
            key={service.id}
          >
            <div className="detailServiceIndex">{service.index}</div>
            <div className="detailServiceContent">
              <p className="detailServiceScript">{service.script}</p>
              <h3>{service.title}</h3>
              {service.body ? <Paragraphs value={service.body} /> : null}
              {"mantra" in service && service.mantra ? (
                <p className="detailServiceMantra">{service.mantra}</p>
              ) : null}
              {"words" in service && service.words ? (
                <div className="detailFourWords">
                  {service.words.map((word) => <span key={word}>{word}</span>)}
                </div>
              ) : null}
              {"meta" in service && service.meta ? (
                <div className="detailServiceMeta">{service.meta}</div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WerkwijzeBody({ t }: { t: (key: string) => string }) {
  return (
    <>
      <SectionShell
        kicker={t("detail_approach_section_kicker")}
        title={t("detail_approach_section_title")}
      >
        <div className="detailLongform">
          <Paragraphs value={t("detail_approach_body")} />
          <p className="detailEmphasis">{t("detail_approach_emphasis")}</p>
        </div>
      </SectionShell>

      <DetailWave from="#f8f4ef" to="#f4eee8" />

      <section className="detailMethodSection">
        <div className="detailEditorialHeading">
          <p className="detailKicker">{t("detail_approach_method_kicker")}</p>
          <h2>{t("detail_approach_method_title")}</h2>
        </div>
        <div className="detailMethodSteps">
          {Array.from({ length: 4 }, (_, index) => (
            <article key={index}>
              <span>0{index + 1}</span>
              <div>
                <h3>{t(`detail_approach_step_${index + 1}_title`)}</h3>
                <p>{t(`detail_approach_step_${index + 1}_body`)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <DetailWave from="#f4eee8" to="#eadbd0" />

      <section className="detailStatement">
        <p>{t("detail_approach_statement")}</p>
      </section>
    </>
  );
}

function OverMijBody({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section className="detailAboutCenteredSection">
        <div className="detailAboutCenteredIntro">
          <p className="detailKicker">{t("detail_about_section_kicker")}</p>
          <h2>{t("detail_about_section_title")}</h2>
        </div>

        <div className="detailAboutCenteredCopy">
          <Paragraphs value={t("detail_about_body")} />
          <p className="detailAboutCenteredEmphasis">
            {t("detail_about_emphasis")}
          </p>
        </div>
      </section>

      <figure className="detailAboutLandscape">
        <Image
          src="/cherelle-elisa-kust.webp"
          alt="Cherelle Elisa aan de kust"
          fill
          sizes="100vw"
          className="detailAboutLandscapeImage"
        />
        <div className="detailAboutLandscapeVeil" aria-hidden="true" />
      </figure>

      <DetailWave from="#d8c6b2" to="#eadbd0" />

      <section className="detailStatement detailAboutStatement">
        <p>{t("detail_about_statement")}</p>
      </section>
    </>
  );
}

function PageBody({ page, t }: { page: DetailKey; t: (key: string) => string }) {
  if (page === "herkenning") return <HerkenningBody t={t} />;
  if (page === "thuiskomen") return <ThuiskomenBody t={t} />;
  if (page === "begeleiding") return <BegeleidingBody t={t} />;
  if (page === "werkwijze") return <WerkwijzeBody t={t} />;
  return <OverMijBody t={t} />;
}

export default function DetailPage({ page }: { page: DetailKey }) {
  const [language, setLanguage] = useState<Language>("nl");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cmsContent, setCmsContent] = useState<CmsContentMap>({ ...DEFAULT_HOMEPAGE_CONTENT });
  const [cmsMedia, setCmsMedia] = useState<Record<string, CmsMedia>>({});
  const config = pageConfig[page];
  const prefix = config.prefix;

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

  const t = (key: string) => contentValue(cmsContent, key, language);
  const heroImage = cmsMedia[config.mediaSlot]?.public_url || config.fallbackImage;
  const heroAlt =
    (language === "nl" ? cmsMedia[config.mediaSlot]?.alt_nl : cmsMedia[config.mediaSlot]?.alt_en) || "";

  return (
    <main className={`detailPage detailPage-${page}`}>
      <header className={`detailHeader ${menuOpen ? "menuOpen" : ""}`}>
        <a className="detailBrand" href="/" onClick={() => setMenuOpen(false)}>CHERELLE ELISA</a>
        <nav className="detailNav" aria-label={language === "nl" ? "Hoofdnavigatie" : "Main navigation"}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item[language]}</a>
          ))}
        </nav>
        <div className="detailUtilities">
          <div className="detailLanguage" aria-label={language === "nl" ? "Taal kiezen" : "Choose language"}>
            <button type="button" className={language === "nl" ? "isActive" : ""} onClick={() => setLanguage("nl")} aria-label="Nederlands">🇳🇱</button>
            <button type="button" className={language === "en" ? "isActive" : ""} onClick={() => setLanguage("en")} aria-label="English">🇬🇧</button>
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

      <section className="detailHero detailHeroEditorial">
        <div className="detailHeroImage">
          <Image src={heroImage} alt={heroAlt} fill priority sizes="100vw" quality={84} unoptimized={heroImage.startsWith("http")} />
          <div className="detailHeroFade" />
        </div>
        <div className="detailHeroCopy">
          <p className="detailKicker">{t(`${prefix}_hero_kicker`)}</p>
          <h1>{t(`${prefix}_hero_title`)}</h1>
          <p>{t(`${prefix}_hero_intro`)}</p>
        </div>
        <div className="detailHeroBottomWave" aria-hidden="true">
          <svg
            viewBox="0 0 1440 180"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,78 C175,34 322,124 520,86 C716,48 876,18 1082,62 C1242,96 1346,120 1440,92 L1440,180 L0,180 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      <div className="detailEditorialFlow">
        <PageBody page={page} t={t} />
        <DetailWave
          from={
            page === "herkenning" ? "#f1e7dc" :
            page === "thuiskomen" ? "#f5eee7" :
            page === "werkwijze" || page === "over-mij" ? "#eadbd0" :
            "#f8f4ef"
          }
          to="#ffffff"
        />
      </div>

      <section className="detailInvitation detailInvitationEditorial">
        <p className="detailKicker">{t(`${prefix}_cta_kicker`)}</p>
        <h2>{t(`${prefix}_cta_title`)}</h2>
        <p>{t(`${prefix}_cta_text`)}</p>
        <a className="detailCta" href={config.nextHref}>
          {t(`${prefix}_cta_label`)} <span aria-hidden="true">→</span>
        </a>
      </section>

      <footer className="detailFooter">
        <a href="/">CHERELLE ELISA</a>
        <a href="/uitnodiging">Contact</a>
      </footer>
    </main>
  );
}
