"use client";

import { FormEvent, useEffect, useState } from "react";

const instagramUrl = "https://www.instagram.com/cherelle_elisa_/";
const accessCode = "Cher2026!";
const accessStorageKey = "cherelle-preview-access";
const menuItems = ["Home", "Herkenning", "Wat er mogelijk is", "Zo kan ik je begeleiden", "Mijn manier van werken", "Over mij", "Ervaringen", "Uitnodiging"] as const;

type MenuItem = (typeof menuItems)[number];

function AnimatedHeroLine({ text, offset = 0, className = "" }: { text: string; offset?: number; className?: string }) {
  return (
    <span className={`siteHeroLine ${className}`.trim()} aria-hidden="true">
      {Array.from(text).map((character, index) => {
        const shuffledStep = ((index * 17 + offset * 11) % 37) + ((index * 7 + offset) % 5) * 37;
        const delay = 120 + shuffledStep * 9;
        return <span className="heroLetter" key={`${offset}-${index}`} style={{ animationDelay: `${delay}ms` }}>{character === " " ? "\u00A0" : character}</span>;
      })}
    </span>
  );
}

function InstagramIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.5" /><circle cx="17.4" cy="6.7" r="1" fill="currentColor" /></svg>;
}

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [hasError, setHasError] = useState(false);
  const [activeItem, setActiveItem] = useState<MenuItem>("Home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setIsUnlocked(window.localStorage.getItem(accessStorageKey) === "unlocked"); }, []);

  function handleAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code === accessCode) {
      window.localStorage.setItem(accessStorageKey, "unlocked");
      setIsUnlocked(true); setCode(""); setHasError(false); return;
    }
    setHasError(true);
  }

  return (
    <main className={`hero ${isUnlocked ? "heroUnlocked" : "heroLocked"}`}>
      <img className="heroBackdrop" src="/HeroCherelle.webp" alt="" aria-hidden="true" />
      <div className="heroVeil" aria-hidden="true" />

      {isUnlocked ? <>
        <header className={`previewHeader ${menuOpen ? "menuOpen" : ""}`}>
          <a className="previewBrand" href="#" onClick={() => { setActiveItem("Home"); setMenuOpen(false); }}>CHERELLE ELISA</a>
          <button className="mobileMenuButton" type="button" aria-label={menuOpen ? "Menu sluiten" : "Menu openen"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            <span /><span />
          </button>
          <nav className="previewNav" aria-label="Hoofdnavigatie">
            {menuItems.map((item) => <button key={item} className={activeItem === item ? "previewNavItem isActive" : "previewNavItem"} type="button" onClick={() => { setActiveItem(item); setMenuOpen(false); }}>{item}</button>)}
          </nav>
        </header>

        <section className="siteHeroContent" aria-labelledby="site-hero-title">
          <h1 id="site-hero-title" className="siteHeroTitle" aria-label="Je bent al zo lang sterk geweest. Maar ben je ook zacht geweest voor jezelf?">
            <AnimatedHeroLine text="Je bent al zo lang sterk geweest." offset={1} />
            <AnimatedHeroLine text="Maar ben je ook zacht geweest voor jezelf?" offset={2} className="siteHeroLineSecondSentence" />
          </h1>
          <p className="siteHeroSubtitle">Voor de vrouw die alles draagt en zichzelf onderweg is kwijtgeraakt.</p>
          <a className="feminineWayButton" href="#herkenning"><span>Ontdek The Feminine Way</span><svg className="feminineWayArrow" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V19M7 14L12 19L17 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
        </section>
      </> : <div className="accessArea"><form className="accessForm" onSubmit={handleAccess}><label className="srOnly" htmlFor="preview-code">Toegangscode</label><input id="preview-code" className="accessInput" type="text" value={code} onChange={(event) => { setCode(event.target.value); if (hasError) setHasError(false); }} placeholder="Toegangscode" autoComplete="off" spellCheck={false} aria-invalid={hasError} /><button className="accessButton" type="submit" aria-label="Website bekijken">→</button></form>{hasError && <p className="accessError">Onjuiste code</p>}</div>}

      {!isUnlocked && <section className="heroContent" aria-labelledby="coming-soon-title"><p className="eyebrow">CHERELLE ELISA</p><h1 id="coming-soon-title">Coming Soon.</h1><p className="intro">Neem nu alvast een kijkje op mijn instagram voor meer info.</p><a className="instagramLink" href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Bekijk Cherelle Elisa op Instagram"><span className="instagramIcon"><InstagramIcon /></span><span className="instagramHandle">@cherelle_elisa_</span><span className="instagramArrow" aria-hidden="true">↗</span></a></section>}
    </main>
  );
}
