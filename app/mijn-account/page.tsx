"use client";

import { useEffect, useState } from "react";
import {
  accountIsAdmin,
  clearAccountSession,
  CmsSession,
  getSavedAccountSession,
  verifyAccountSession,
} from "../../lib/cherelleCms";

export default function ClientAccountPage() {
  const [session, setSession] = useState<CmsSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const saved = getSavedAccountSession();
      if (!saved || !(await verifyAccountSession(saved))) {
        clearAccountSession();
        window.location.replace("/account");
        return;
      }

      if (await accountIsAdmin(saved)) {
        window.location.replace("/admin");
        return;
      }

      if (active) {
        setSession(saved);
        setReady(true);
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, []);

  function logout() {
    clearAccountSession();
    window.location.replace("/");
  }

  if (!ready || !session) {
    return (
      <main className="clientPortalPage">
        <div className="accountPortalLoading">Persoonlijke omgeving laden…</div>
      </main>
    );
  }

  return (
    <main className="clientPortalPage">
      <header className="clientPortalHeader">
        <a href="/">CHERELLE ELISA</a>
        <button type="button" onClick={logout}>Uitloggen</button>
      </header>

      <section className="clientPortalHero">
        <p className="accountPortalScript">jouw plek</p>
        <h1>Persoonlijke omgeving</h1>
        <p>{session.user.email}</p>
      </section>

      <section className="clientPortalContent">
        <div className="clientPortalEmpty">
          <span>01</span>
          <h2>Jouw persoonlijke omgeving is klaar.</h2>
          <p>
            Er zijn op dit moment nog geen persoonlijke onderdelen aan jouw account gekoppeld.
          </p>
        </div>
      </section>
    </main>
  );
}
