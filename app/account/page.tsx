"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  accountIsAdmin,
  getSavedAccountSession,
  getSavedCmsSession,
  loginAccount,
  verifyAccountSession,
  verifyCmsSession,
} from "../../lib/cherelleCms";

export default function AccountPage() {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const adminSession = getSavedCmsSession();
        if (adminSession && await verifyCmsSession(adminSession)) {
          if (active) window.location.replace("/admin");
          return;
        }

        const saved = getSavedAccountSession();
        if (saved && await verifyAccountSession(saved)) {
          const isAdmin = await accountIsAdmin(saved);
          if (active) window.location.replace(isAdmin ? "/admin" : "/mijn-account");
          return;
        }
      } catch {
        if (active) {
          setError("De persoonlijke omgeving kon niet worden bereikt. Je kunt hieronder opnieuw proberen in te loggen.");
        }
      } finally {
        if (active) setReady(true);
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = await loginAccount(email.trim(), password);
      window.location.replace(result.isAdmin ? "/admin" : "/mijn-account");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Inloggen is mislukt.");
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <main className="accountPortalPage">
        <div className="accountPortalLoading">Persoonlijke omgeving laden…</div>
      </main>
    );
  }

  return (
    <main className="accountPortalPage">
      <a className="accountPortalBack" href="/">← Terug naar website</a>

      <section className="accountPortalCard">
        <p className="accountPortalScript">Cherelle Elisa</p>
        <p className="accountPortalKicker">Persoonlijke omgeving</p>
        <h1>Welkom terug.</h1>
        <p className="accountPortalIntro">
          Log in met het e-mailadres dat aan jouw account is gekoppeld.
        </p>

        <form className="accountPortalForm" onSubmit={handleLogin}>
          <label>
            <span>E-mailadres</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Wachtwoord</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="accountPortalError">{error}</p>}

          <button type="submit" disabled={busy}>
            {busy ? "Inloggen…" : "Inloggen"}
          </button>
        </form>
      </section>
    </main>
  );
}
