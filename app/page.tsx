"use client";

import { FormEvent, useEffect, useState } from "react";

const instagramUrl = "https://www.instagram.com/cherelle_elisa_/";
const accessCode = "Cher2026!";
const accessStorageKey = "cherelle-preview-access";
const menuItems = ["Home", "About me", "Services", "Events"] as const;

type MenuItem = (typeof menuItems)[number];

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.4" cy="6.7" r="1" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [hasError, setHasError] = useState(false);
  const [activeItem, setActiveItem] = useState<MenuItem>("Home");

  useEffect(() => {
    setIsUnlocked(window.localStorage.getItem(accessStorageKey) === "unlocked");
  }, []);

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

  return (
    <main className={`hero ${isUnlocked ? "heroUnlocked" : "heroLocked"}`}>
      <div className="heroBackdrop" aria-hidden="true" />
      <div className="heroVeil" aria-hidden="true" />

      {isUnlocked ? (
        <header className="previewHeader">
          <a className="previewBrand" href="#" onClick={() => setActiveItem("Home")}>
            CHERELLE ELISA
          </a>

          <nav className="previewNav" aria-label="Hoofdnavigatie">
            {menuItems.map((item) => (
              <button
                key={item}
                className={activeItem === item ? "previewNavItem isActive" : "previewNavItem"}
                type="button"
                onClick={() => setActiveItem(item)}
              >
                {item}
              </button>
            ))}
          </nav>
        </header>
      ) : (
        <div className="accessArea">
          <form className="accessForm" onSubmit={handleAccess}>
            <label className="srOnly" htmlFor="preview-code">
              Toegangscode
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
              placeholder="Toegangscode"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={hasError}
            />
            <button className="accessButton" type="submit" aria-label="Website bekijken">
              →
            </button>
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
            <span className="instagramIcon">
              <InstagramIcon />
            </span>
            <span className="instagramHandle">@cherelle_elisa_</span>
            <span className="instagramArrow" aria-hidden="true">↗</span>
          </a>
        </section>
      )}
    </main>
  );
}
