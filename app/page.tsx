"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

const instagramUrl = "https://www.instagram.com/cherelle_elisa_/";
const accessCode = "Cher2026!";
const accessStorageKey = "cherelle-preview-access";

const menuItems = [
  { label: "Herkenning", id: "herkenning" },
  { label: "Wat er mogelijk is", id: "mogelijkheden" },
  { label: "Zo kan ik je begeleiden", id: "begeleiding" },
  { label: "Mijn manier van werken", id: "werkwijze" },
  { label: "Over mij", id: "over-mij" },
  { label: "Ervaringen", id: "ervaringen" },
  { label: "Uitnodiging", id: "uitnodiging" },
] as const;

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

  useEffect(() => {
    setIsUnlocked(window.localStorage.getItem(accessStorageKey) === "unlocked");
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

  return (
    <main className={isUnlocked ? "siteRoot" : "siteRoot siteRootLocked"}>
      <section id="top" className={`hero ${isUnlocked ? "heroUnlocked" : "heroLocked"}`}>
        <Image
          className="heroBackdrop"
          src="/HeroCherelle.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          quality={82}
        />
        <div className="heroVeil" aria-hidden="true" />

        {isUnlocked ? (
          <>
            <header className={`previewHeader ${menuOpen ? "menuOpen" : ""}`}>
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
                    {item.label}
                  </button>
                ))}
              </nav>
            </header>

            <section className="siteHeroContent" aria-labelledby="site-hero-title">
              <h1
                id="site-hero-title"
                className="siteHeroTitle"
                aria-label="Je bent al zo lang sterk geweest. Maar ben je ook zacht geweest voor jezelf?"
              >
                <span className="desktopHeroTitle">
                  <AnimatedHeroLine text="Je bent al zo lang sterk geweest." offset={1} />
                  <AnimatedHeroLine
                    text="Maar ben je ook zacht geweest"
                    offset={2}
                    className="siteHeroLineSecondSentence"
                  />
                  <AnimatedHeroLine text="voor jezelf?" offset={3} />
                </span>

                <span className="mobileHeroTitle" aria-hidden="true">
                  <span className="mobileHeroSentence">Je bent al zo lang sterk geweest.</span>
                  <span className="mobileHeroSentence mobileHeroSentenceSecond">
                    Maar ben je ook zacht geweest voor jezelf?
                  </span>
                </span>
              </h1>

              <p className="siteHeroSubtitle">
                Voor de vrouw die alles draagt en zichzelf onderweg is kwijtgeraakt.
              </p>

              <a className="feminineWayButton" href="#herkenning">
                <span>Ontdek The Feminine Way</span>
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
              <label className="srOnly" htmlFor="preview-code">Toegangscode</label>
              <input
                id="preview-code"
                className="accessInput"
                type="text"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (hasError) setHasError(false);
                }}
                placeholder="Toegangscode"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={hasError}
              />
              <button className="accessButton" type="submit" aria-label="Website bekijken">→</button>
            </form>
            {hasError && <p className="accessError">Onjuiste code</p>}
          </div>
        )}

        {!isUnlocked && (
          <section className="heroContent" aria-labelledby="coming-soon-title">
            <p className="eyebrow">CHERELLE ELISA</p>
            <h1 id="coming-soon-title">Coming Soon.</h1>
            <p className="intro">Neem nu alvast een kijkje op mijn instagram voor meer info.</p>
            <a
              className="instagramLink"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Bekijk Cherelle Elisa op Instagram"
            >
              <span className="instagramIcon"><InstagramIcon /></span>
              <span className="instagramHandle">@cherelle_elisa_</span>
              <span className="instagramArrow" aria-hidden="true">↗</span>
            </a>
          </section>
        )}
      </section>

      {isUnlocked && (
        <>

          <section id="herkenning" className="contentSection sectionSplit">
            <div data-reveal>
              <PhotoPlaceholder
                note="Rustig sfeerbeeld, bijvoorbeeld handen op de buik of een vrouw met gesloten ogen"
                className="photoPlaceholderSoft"
              />
            </div>
            <div className="sectionCopy" data-reveal>
              <p className="sectionKicker">Herkenning</p>
              <h2>Herken je dit?</h2>
              <p>
                Je staat altijd klaar, voor je werk, je gezin en iedereen om je heen.
                &apos;s Avonds lig je in bed en je hoofd blijft maar doorgaan. Je bent moe,
                al zo lang dat je bijna vergeten bent hoe het anders voelde. Van buiten ziet
                je leven er goed uit, en toch vraag je je soms af waarom jij dat geluk niet voelt.
              </p>
              <p className="sectionEmphasis">
                Er is niets mis met je. Je hebt alleen heel lang gezocht op een plek waar het
                niet te vinden is.
              </p>
            </div>
          </section>

          <section id="mogelijkheden" className="contentSection sectionSplit sectionSplitReverse">
            <div className="sectionCopy" data-reveal>
              <p className="sectionKicker">Wat er mogelijk is</p>
              <h2>Thuiskomen in je lichaam</h2>
              <p>
                Stel je voor dat je weer voelt wat je nodig hebt, en daar ook naar durft te
                handelen. Dat je nee kunt zeggen zonder schuldgevoel en hulp kunt aannemen
                zonder dat het ongemakkelijk voelt. Dat je rust neemt omdat je moe bent, en
                dat er weer ruimte is voor plezier, sensualiteit en vrijheid.
              </p>
              <p className="sectionManifesto">
                Van hoofd naar hart.<br />
                Van doen naar zijn.<br />
                Van controle naar overgave.
              </p>
            </div>
            <div data-reveal>
              <PhotoPlaceholder
                note="Egypte, foto met armen omhoog bij de rotsen"
                className="photoPlaceholderEarth"
              />
            </div>
          </section>

          <section id="begeleiding" className="offersSection">
            <div className="offersIntro" data-reveal>
              <p className="sectionKicker">Zo kan ik je begeleiden</p>
              <h2>Een vorm die past bij waar jij nu bent.</h2>
            </div>

            <div className="offerList">
              <article className="offerRow" data-reveal>
                <span className="offerNumber">01</span>
                <div className="offerBody">
                  <h3>The Feminine Way</h3>
                  <p>
                    Een persoonlijk traject van zes maanden waarin je stap voor stap terugkomt
                    in je lichaam en weer leert leven vanuit je vrouwelijke energie. Volledig
                    afgestemd op jou en in jouw tempo. Veel vrouwen merken dat ze na dit traject
                    rustiger zijn, beter voelen wat ze nodig hebben en weer kunnen ontvangen.
                  </p>
                  <button className="sectionLink" type="button">
                    Lees meer <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>

              <article className="offerRow" data-reveal>
                <span className="offerNumber">02</span>
                <div className="offerBody">
                  <h3>1-op-1 sessie</h3>
                  <p>
                    Een sessie van ongeveer anderhalf uur waarin we samen werken met wat er op
                    dat moment in jou leeft. Ook mogelijk samen met je partner, vriendin of moeder.
                  </p>
                  <button className="sectionLink" type="button">
                    Bekijk sessies <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>

              <article className="offerRow" data-reveal>
                <span className="offerNumber">03</span>
                <div className="offerBody">
                  <h3>Ceremonies</h3>
                  <p>
                    Samen met andere vrouwen ruimte maken om te voelen, los te laten en te verbinden.
                  </p>
                  <button className="sectionLink" type="button">
                    Bekijk ceremonies <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section id="werkwijze" className="methodSection">
            <div className="methodInner" data-reveal>
              <p className="sectionKicker">Mijn manier van werken</p>
              <div className="methodColumns">
                <p className="methodLead">
                  We werken altijd in jouw tempo. Soms raken we diepe lagen aan, zoals oude patronen
                  of wat je van thuis hebt meegekregen. Daar ga ik zorgvuldig mee om, zodat het veilig
                  voelt en je niets hoeft te forceren.
                </p>
                <div className="methodSide">
                  <p className="methodLead methodLeadSecondary">
                    Jij bepaalt waar je naartoe wilt, ik loop met je mee en hou je vast als het spannend wordt.
                  </p>
                  <p className="methodNote">
                    Mijn begeleiding is geen vervanging van therapie of medische zorg. Twijfel je of dit
                    bij je past? Dan bespreken we dat gewoon samen.
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
              <p className="sectionKicker">Over mij</p>
              <h2>Ik ben Cherelle</h2>
              <p>
                Ik ken dit van binnenuit. Jarenlang deed ik alles goed: harder werken, meer leren,
                er altijd voor anderen zijn. En toch bleef het van binnen leeg. Op een reis naar
                Egypte voelde ik voor het eerst hoe het is om gewoon te zijn, vrij en in het moment.
              </p>
              <p>
                Sindsdien begeleid ik vrouwen terug naar zichzelf. Inmiddels zijn dat er zo&apos;n
                500, en organiseerde ik ongeveer 15 ceremonies.
              </p>
              <button className="sectionLink sectionLinkLarge" type="button">
                Lees mijn verhaal <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>

          <section id="ervaringen" className="testimonialsSection">
            <div className="testimonialsHeading" data-reveal>
              <p className="sectionKicker">Ervaringen</p>
              <h2>Wat vrouwen zeggen</h2>
            </div>

            <div className="testimonialsGrid" aria-label="Ruimte voor ervaringen">
              {[1, 2, 3].map((item) => (
                <article className="testimonialSlot" key={item} data-reveal>
                  <span>Ervaring 0{item}</span>
                  <p>Ruimte voor haar ervaring, in haar eigen woorden.</p>
                </article>
              ))}
            </div>
          </section>

          <section id="uitnodiging" className="invitationSection">
            <div className="invitationCopy" data-reveal>
              <p className="sectionKicker">Uitnodiging</p>
              <h2>Voel je dat het tijd is?</h2>
              <p>
                Plan een vrijblijvend kennismakingsgesprek. We kijken samen waar je nu staat en
                wat bij je past. Je mag ook gewoon een berichtje sturen.
              </p>
              <button className="sectionLink sectionLinkLarge" type="button">
                Plan een kennismaking <span aria-hidden="true">→</span>
              </button>
            </div>
            <div data-reveal>
              <PhotoPlaceholder
                note="Warm uitnodigend beeld, bijvoorbeeld de omhelzing uit de folder"
                className="photoPlaceholderWarm"
              />
            </div>
          </section>

          <footer className="siteFooter">
            <div className="footerBrand" data-reveal>
              <a href="#top">CHERELLE ELISA</a>
              <p>Een zachtere weg naar jezelf.</p>
            </div>

            <nav className="footerNav" aria-label="Footer navigatie" data-reveal>
              {menuItems.map((item) => (
                <a key={item.id} href={`#${item.id}`}>
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="footerMeta" data-reveal>
              <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a>
              <span>© 2026 Cherelle Elisa</span>
            </div>
          </footer>
        </>
      )}
    </main>
  );
}
