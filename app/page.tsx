const instagramUrl = "https://www.instagram.com/cherelle_elisa_/";

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
  return (
    <main className="hero">
      <div className="heroBackdrop" aria-hidden="true" />
      <div className="heroVeil" aria-hidden="true" />

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
    </main>
  );
}
