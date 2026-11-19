"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  activateClientAccount,
  CmsSession,
  saveAccountSession,
  setAccountPassword,
  verifyClientInviteToken,
} from "../../../lib/cherelleCms";

type Phase = "verifying" | "password" | "saving" | "error";

export default function AccountSetupPage() {
  const started = useRef(false);
  const [phase, setPhase] = useState<Phase>("verifying");
  const [session, setSession] = useState<CmsSession | null>(null);
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function verifyInvite() {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash") ?? "";
      const type = params.get("type") ?? "";

      try {
        const nextSession = await verifyClientInviteToken(tokenHash, type);
        setSession(nextSession);
        window.history.replaceState({}, document.title, "/account/setup");
        setPhase("password");
      } catch (verifyError) {
        setError(
          verifyError instanceof Error
            ? verifyError.message
            : "Deze uitnodiging kon niet worden geopend."
        );
        setPhase("error");
      }
    }

    void verifyInvite();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    if (password.length < 8) {
      setError("Gebruik minimaal 8 tekens voor je wachtwoord.");
      return;
    }

    if (password !== passwordAgain) {
      setError("De wachtwoorden zijn niet hetzelfde.");
      return;
    }

    setPhase("saving");
    setError("");

    try {
      await setAccountPassword(session, password);
      await activateClientAccount(session);
      saveAccountSession(session);
      window.location.replace("/mijn-account");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Je wachtwoord kon niet worden opgeslagen."
      );
      setPhase("password");
    }
  }

  return (
    <main className="accountSetupPage">
      <a className="accountPortalBack" href="/">← Terug naar website</a>

      <section className="accountSetupCard">
        <p className="accountPortalScript">Cherelle Elisa</p>
        <p className="accountPortalKicker">Jouw persoonlijke omgeving</p>

        {phase === "verifying" && (
          <>
            <h1>Uitnodiging openen.</h1>
            <p className="accountPortalIntro">
              We controleren jouw persoonlijke uitnodiging.
            </p>
            <div className="accountSetupProgress" aria-label="Uitnodiging controleren">
              <span />
            </div>
          </>
        )}

        {(phase === "password" || phase === "saving") && (
          <>
            <h1>Maak jouw wachtwoord aan.</h1>
            <p className="accountPortalIntro">
              Daarna kom je direct in jouw eigen omgeving met de intake en voorbereiding voor jouw sessie.
            </p>

            <form className="accountPortalForm" onSubmit={handleSubmit}>
              <label>
                <span>Nieuw wachtwoord</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <label>
                <span>Herhaal wachtwoord</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordAgain}
                  onChange={(event) => setPasswordAgain(event.target.value)}
                  minLength={8}
                  required
                />
              </label>

              {error && <p className="accountPortalError">{error}</p>}

              <button type="submit" disabled={phase === "saving"}>
                {phase === "saving" ? "Jouw omgeving klaarzetten…" : "Wachtwoord opslaan"}
              </button>
            </form>
          </>
        )}

        {phase === "error" && (
          <>
            <h1>Deze link werkt niet meer.</h1>
            <p className="accountPortalIntro">{error}</p>
            <a className="accountSetupLoginLink" href="/account">
              Heb je al een wachtwoord? Log hier in →
            </a>
          </>
        )}
      </section>
    </main>
  );
}
