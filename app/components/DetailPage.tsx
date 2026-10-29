"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
  { href: "/#ervaringen", nl: "Ervaringen", en: "Experiences" },
  { href: "/#uitnodiging", nl: "Uitnodiging", en: "Invitation" },
];

const pages = {
  herkenning: {
    image: "/Herkenning.jpg",
    kicker: { nl: "Herkenning", en: "Recognition" },
    title: { nl: "Als je alles draagt, raak je jezelf soms stilletjes kwijt.", en: "When you carry everything, you can quietly lose yourself." },
    intro: {
      nl: "Je hoeft niet eerst vast te lopen om te mogen erkennen dat het veel is. Soms zit de eerste beweging juist in eerlijk voelen wat je al die tijd hebt weggeduwd.",
      en: "You do not have to break down before you are allowed to admit it is a lot. Sometimes the first movement begins with honestly feeling what you have pushed aside."
    },
    blocks: [
      {
        title: { nl: "Altijd aan", en: "Always on" },
        text: { nl: "Je regelt, zorgt en denkt vooruit. Aan de buitenkant functioneert alles, terwijl je vanbinnen steeds minder ruimte ervaart om gewoon te zijn.", en: "You organise, care and think ahead. From the outside everything functions, while inside there is less and less room to simply be." }
      },
      {
        title: { nl: "Terug naar wat jij voelt", en: "Back to what you feel" },
        text: { nl: "Herkenning is geen oordeel. Het is een uitnodiging om opnieuw te luisteren naar je lichaam, je grenzen en wat jij nodig hebt.", en: "Recognition is not a judgement. It is an invitation to listen again to your body, your boundaries and what you need." }
      }
    ],
    quote: { nl: "Je hoeft niet nog sterker te worden. Misschien mag je juist zachter worden voor jezelf.", en: "You do not need to become stronger. Maybe you are allowed to become gentler with yourself." }
  },
  thuiskomen: {
    image: "/Thuiskomen.jpg",
    kicker: { nl: "Thuiskomen", en: "Coming home" },
    title: { nl: "Van hoofd naar hart. Van doorgaan naar voelen.", en: "From head to heart. From pushing through to feeling." },
    intro: {
      nl: "Thuiskomen betekent niet dat alles ineens rustig is. Het betekent dat je jezelf weer kunt horen, ook wanneer het leven beweegt.",
      en: "Coming home does not mean everything suddenly becomes quiet. It means you can hear yourself again, even while life is moving."
    },
    blocks: [
      {
        title: { nl: "Voelen wat je nodig hebt", en: "Feeling what you need" },
        text: { nl: "Niet vanuit wat hoort of verwacht wordt, maar vanuit wat je lichaam je vertelt. Rust, afstand, verbinding, plezier of juist helderheid.", en: "Not from what should be done or what is expected, but from what your body tells you. Rest, distance, connection, pleasure or clarity." }
      },
      {
        title: { nl: "Ruimte om te ontvangen", en: "Space to receive" },
        text: { nl: "Je hoeft niet alles zelf te dragen. Thuiskomen is ook leren ontvangen: hulp, aandacht, rust en zachtheid.", en: "You do not have to carry everything yourself. Coming home is also learning to receive help, attention, rest and gentleness." }
      }
    ],
    quote: { nl: "Van controle naar vertrouwen. Van moeten naar mogen.", en: "From control to trust. From having to, to being allowed to." }
  },
  begeleiding: {
    image: "/feminine.jpg",
    kicker: { nl: "Begeleiding", en: "Guidance" },
    title: { nl: "Een vorm die past bij waar jij nu bent.", en: "A form of support that meets you where you are." },
    intro: {
      nl: "Soms heb je behoefte aan een langer traject, soms aan één verdiepend moment en soms juist aan de kracht van een groep. We kiezen wat past.",
      en: "Sometimes you need a longer journey, sometimes one deeper moment, and sometimes the strength of a group. We choose what fits."
    },
    blocks: [
      {
        id: "the-feminine-way",
        title: { nl: "The Feminine Way", en: "The Feminine Way" },
        text: { nl: "Een persoonlijk traject van zes maanden waarin je stap voor stap terugkomt in je lichaam en leert leven vanuit meer rust, zachtheid en verbinding.", en: "A personal six-month journey in which you gradually return to your body and learn to live with more calm, gentleness and connection." }
      },
      {
        id: "een-op-een",
        title: { nl: "1-op-1 sessie", en: "1-to-1 session" },
        text: { nl: "Een sessie van ongeveer anderhalf uur rondom wat er op dat moment in jou leeft. Gericht, persoonlijk en in jouw tempo.", en: "A session of around ninety minutes around whatever is alive in you at that moment. Focused, personal and at your pace." }
      },
      {
        id: "ceremonies",
        title: { nl: "Ceremonies", en: "Ceremonies" },
        text: { nl: "Samen met andere vrouwen ruimte maken om te voelen, los te laten en te verbinden.", en: "Creating space with other women to feel, let go and connect." }
      }
    ],
    quote: { nl: "Je hoeft vooraf niet precies te weten welke vorm bij je past. Dat kunnen we samen onderzoeken.", en: "You do not need to know beforehand exactly which form suits you. We can explore that together." }
  },
  werkwijze: {
    image: "/Werkwijze.webp",
    kicker: { nl: "Werkwijze", en: "Approach" },
    title: { nl: "Zorgvuldig, lichaamsgericht en altijd in jouw tempo.", en: "Careful, body-oriented and always at your pace." },
    intro: {
      nl: "Er hoeft niets geforceerd te worden. We werken met wat zich aandient en blijven steeds afstemmen op wat veilig en passend voelt.",
      en: "Nothing needs to be forced. We work with what arises and keep tuning in to what feels safe and appropriate."
    },
    blocks: [
      {
        title: { nl: "Jij bepaalt de richting", en: "You set the direction" },
        text: { nl: "Ik loop met je mee, stel vragen, spiegel en help vertragen wanneer dat nodig is. Jij houdt de regie over jouw proces.", en: "I walk beside you, ask questions, reflect and help slow things down when needed. You remain in charge of your process." }
      },
      {
        title: { nl: "Geen haast, geen moeten", en: "No rush, no pressure" },
        text: { nl: "Ook diepere patronen mogen aandacht krijgen, maar alleen op een manier die voor jou klopt. Mijn begeleiding is geen vervanging voor therapie of medische zorg.", en: "Deeper patterns can receive attention too, but only in a way that feels right for you. My guidance is not a replacement for therapy or medical care." }
      }
    ],
    quote: { nl: "Je hoeft nergens doorheen te breken. We luisteren naar wat er klaar is om gezien te worden.", en: "You do not have to break through anything. We listen to what is ready to be seen." }
  },
  "over-mij": {
    image: "/Overmij.webp",
    kicker: { nl: "Over mij", en: "About me" },
    title: { nl: "Ik ben Cherelle.", en: "I’m Cherelle." },
    intro: {
      nl: "Ik ken de beweging van altijd sterk zijn naar opnieuw leren voelen van binnenuit. Niet als theorie, maar uit mijn eigen leven.",
      en: "I know the movement from always being strong to learning to feel from within again. Not as theory, but from my own life."
    },
    blocks: [
      {
        title: { nl: "Mijn eigen omslag", en: "My own turning point" },
        text: { nl: "Jarenlang deed ik alles goed: harder werken, meer leren en er voor anderen zijn. Tijdens een reis naar Egypte ervoer ik voor het eerst hoe het voelde om gewoon te zijn, vrij en aanwezig.", en: "For years I did everything right: working harder, learning more and being there for others. During a journey to Egypt I experienced for the first time what it felt like to simply be, free and present." }
      },
      {
        title: { nl: "Wat ik nu doorgeef", en: "What I now pass on" },
        text: { nl: "Sindsdien begeleid ik vrouwen terug naar zichzelf. Met aandacht voor het lichaam, voor eerlijk voelen en voor een tempo dat werkelijk bij jou past.", en: "Since then I have guided women back to themselves, with attention to the body, honest feeling and a pace that truly suits you." }
      }
    ],
    quote: { nl: "Voor mij gaat dit werk niet over een betere versie van jezelf worden, maar over dichter komen bij wie je al bent.", en: "For me, this work is not about becoming a better version of yourself, but about coming closer to who you already are." }
  }
} satisfies Record<DetailKey, any>;

export default function DetailPage({ page }: { page: DetailKey }) {
  const [language, setLanguage] = useState<Language>("nl");
  const [menuOpen, setMenuOpen] = useState(false);
  const content = pages[page];

  useEffect(() => {
    const saved = window.localStorage.getItem(languageStorageKey);
    if (saved === "nl" || saved === "en") setLanguage(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <main className="detailPage">
      <header className={`detailHeader ${menuOpen ? "menuOpen" : ""}`}>
        <a className="detailBrand" href="/" onClick={() => setMenuOpen(false)}>CHERELLE ELISA</a>
        <nav className="detailNav" aria-label={language === "nl" ? "Hoofdnavigatie" : "Main navigation"}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item[language]}</a>
          ))}
        </nav>
        <div className="detailLanguage" aria-label={language === "nl" ? "Taal kiezen" : "Choose language"}>
          <button type="button" className={language === "nl" ? "isActive" : ""} onClick={() => setLanguage("nl")}>NL</button>
          <span>/</span>
          <button type="button" className={language === "en" ? "isActive" : ""} onClick={() => setLanguage("en")}>EN</button>
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

      <section className="detailHero">
        <div className="detailHeroImage">
          <Image src={content.image} alt="" fill priority sizes="100vw" quality={84} />
          <div className="detailHeroFade" />
        </div>
        <div className="detailHeroCopy">
          <p className="detailKicker">{content.kicker[language]}</p>
          <h1>{content.title[language]}</h1>
          <p>{content.intro[language]}</p>
        </div>
      </section>

      <section className="detailContent">
        <div className="detailContentIntro">
          <p className="detailKicker">{content.kicker[language]}</p>
          <h2>{language === "nl" ? "Ruimte om dichter bij jezelf te komen." : "Space to come closer to yourself."}</h2>
        </div>
        <div className="detailBlocks">
          {content.blocks.map((block: any, index: number) => (
            <article className="detailBlock" id={block.id} key={block.title.nl}>
              <span>0{index + 1}</span>
              <h3>{block.title[language]}</h3>
              <p>{block.text[language]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="detailQuote">
        <p>{content.quote[language]}</p>
      </section>

      <section className="detailInvitation">
        <p className="detailKicker">{language === "nl" ? "Een eerste stap" : "A first step"}</p>
        <h2>{language === "nl" ? "Voel je dat je hier verder in wilt?" : "Do you feel you want to explore this further?"}</h2>
        <p>{language === "nl" ? "Je hoeft het nog niet precies te weten. Een kennismaking is er juist om samen te voelen wat bij je past." : "You do not need to know exactly yet. An introductory conversation is there to explore together what fits you."}</p>
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
