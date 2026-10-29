"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  clearCmsSession,
  CmsContentMap,
  CmsMedia,
  CmsReview,
  CmsSession,
  CONTENT_GROUPS,
  DEFAULT_HOMEPAGE_CONTENT,
  getSavedCmsSession,
  isCmsConfigured,
  loadAdminCms,
  loginCms,
  signupCms,
  MEDIA_SLOTS,
  saveContentGroup,
  saveReview,
  deleteReview,
  uploadMedia,
  verifyCmsSession,
} from "../../lib/cherelleCms";
import styles from "./admin.module.css";

type AdminTab = "overzicht" | "teksten" | "ervaringen" | "beelden";

const FIELD_LABELS: Record<string, string> = {
  hero_sentence_1: "Hero – regel 1",
  hero_sentence_2: "Hero – regel 2",
  hero_subtitle: "Hero – subtitel",
  hero_cta: "Hero – knop",
  quote_bar: "Quote-balk",
  recognition_kicker: "Bovenregel",
  recognition_title: "Titel",
  recognition_body: "Hoofdtekst",
  recognition_emphasis: "Accenttekst",
  recognition_cta: "Knoptekst",
  homecoming_kicker: "Bovenregel",
  homecoming_title: "Titel",
  homecoming_body: "Hoofdtekst",
  homecoming_manifesto: "Manifest",
  homecoming_cta: "Knoptekst",
  guidance_kicker: "Bovenregel",
  guidance_title: "Titel",
  guidance_1_title: "Dienst 1 – titel",
  guidance_1_body: "Dienst 1 – tekst",
  guidance_1_cta: "Dienst 1 – knop",
  guidance_2_title: "Dienst 2 – titel",
  guidance_2_body: "Dienst 2 – tekst",
  guidance_2_cta: "Dienst 2 – knop",
  guidance_3_title: "Dienst 3 – titel",
  guidance_3_body: "Dienst 3 – tekst",
  guidance_3_cta: "Dienst 3 – knop",
  approach_kicker: "Bovenregel",
  approach_body: "Hoofdtekst",
  approach_emphasis: "Accenttekst",
  approach_note: "Kleine toelichting",
  approach_cta: "Knoptekst",
  reviews_kicker: "Bovenregel",
  reviews_title: "Titel",
  about_kicker: "Bovenregel",
  about_title: "Titel",
  about_body_1: "Alinea 1",
  about_body_2: "Alinea 2",
  about_cta: "Knoptekst",
  invitation_kicker: "Bovenregel",
  invitation_title: "Titel",
  invitation_body: "Hoofdtekst",
};

function isLongField(key: string) {
  return /(body|emphasis|note|manifesto|subtitle|sentence)/.test(key);
}

function emptyReview(sortOrder: number): Omit<CmsReview, "id"> {
  return {
    name: "",
    role_nl: "",
    role_en: "",
    quote_nl: "",
    quote_en: "",
    is_published: true,
    sort_order: sortOrder,
  };
}

export default function CherelleAdminPage() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<CmsSession | null>(null);
  const [tab, setTab] = useState<AdminTab>("overzicht");
  const [content, setContent] = useState<CmsContentMap>({ ...DEFAULT_HOMEPAGE_CONTENT });
  const [reviews, setReviews] = useState<CmsReview[]>([]);
  const [media, setMedia] = useState<Record<string, CmsMedia>>({});

  const [email, setEmail] = useState("info@cherelleelisa.nl");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingReview, setEditingReview] = useState<(Omit<CmsReview, "id"> & { id?: string }) | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  const publishedReviews = useMemo(
    () => reviews.filter((review) => review.is_published).length,
    [reviews]
  );

  useEffect(() => {
    let active = true;

    async function initialize() {
      if (!isCmsConfigured) {
        if (active) setReady(true);
        return;
      }

      const saved = getSavedCmsSession();
      if (!saved) {
        if (active) setReady(true);
        return;
      }

      const valid = await verifyCmsSession(saved);
      if (!valid) {
        clearCmsSession();
        if (active) setReady(true);
        return;
      }

      try {
        const data = await loadAdminCms(saved);
        if (!active) return;
        setSession(saved);
        setContent(data.content);
        setReviews(data.reviews);
        setMedia(data.media);
      } catch {
        clearCmsSession();
      } finally {
        if (active) setReady(true);
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, []);

  async function reload(nextSession = session) {
    if (!nextSession) return;
    const data = await loadAdminCms(nextSession);
    setContent(data.content);
    setReviews(data.reviews);
    setMedia(data.media);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const nextSession = await loginCms(email.trim(), password);
      setSession(nextSession);
      setPassword("");
      await reload(nextSession);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Inloggen is mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function handleActivation() {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== "info@cherelleelisa.nl") {
      setError("Alleen info@cherelleelisa.nl kan als beheerder worden geactiveerd.");
      return;
    }

    if (password.length < 8) {
      setError("Gebruik minimaal 8 tekens voor het wachtwoord.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await signupCms(normalizedEmail, password);
      setMessage(
        "Account is aangemaakt. Controleer info@cherelleelisa.nl en bevestig de Supabase-mail. Keer daarna terug naar /admin en log in."
      );
    } catch (activationError) {
      setError(
        activationError instanceof Error
          ? activationError.message
          : "Account activeren is mislukt."
      );
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    clearCmsSession();
    setSession(null);
    setEmail("");
    setPassword("");
    setMessage("");
    setError("");
  }

  function updateContent(key: string, language: "nl" | "en", value: string) {
    setContent((current) => ({
      ...current,
      [key]: {
        ...(current[key] ?? { nl: "", en: "" }),
        [language]: value,
      },
    }));
  }

  async function saveGroup(title: string, keys: readonly string[]) {
    if (!session) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await saveContentGroup(session, content, keys);
      setMessage(`${title} is opgeslagen.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Opslaan is mislukt.");
    } finally {
      setBusy(false);
    }
  }

  function openNewReview() {
    const nextSort = reviews.length ? Math.max(...reviews.map((review) => review.sort_order)) + 1 : 0;
    setEditingReview(emptyReview(nextSort));
  }

  function openExistingReview(review: CmsReview) {
    setEditingReview({ ...review });
  }

  async function handleReviewSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !editingReview) return;
    if (!editingReview.name.trim() || !editingReview.quote_nl.trim()) {
      setError("Vul minimaal een naam en Nederlandse ervaring in.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await saveReview(session, {
        ...editingReview,
        name: editingReview.name.trim(),
        role_nl: editingReview.role_nl?.trim() || null,
        role_en: editingReview.role_en?.trim() || null,
        quote_nl: editingReview.quote_nl.trim(),
        quote_en: editingReview.quote_en.trim() || editingReview.quote_nl.trim(),
      });
      await reload();
      setEditingReview(null);
      setMessage("Ervaring is opgeslagen.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Ervaring kon niet worden opgeslagen.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReviewDelete(review: CmsReview) {
    if (!session || !window.confirm(`Ervaring van ${review.name} definitief verwijderen?`)) return;
    setBusy(true);
    setError("");
    try {
      await deleteReview(session, review.id);
      await reload();
      setMessage("Ervaring is verwijderd.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Verwijderen is mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMediaUpload(
    slot: string,
    file: File,
    altNl: string,
    altEn: string
  ) {
    if (!session) return;
    if (!file.type.startsWith("image/")) {
      setError("Kies een afbeelding.");
      return;
    }

    setUploadingSlot(slot);
    setError("");
    setMessage("");
    try {
      const item = await uploadMedia(session, slot, file, altNl, altEn);
      setMedia((current) => ({ ...current, [slot]: item }));
      setMessage("Foto is vervangen.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Uploaden is mislukt.");
    } finally {
      setUploadingSlot(null);
    }
  }

  if (!ready) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>Beheeromgeving laden…</div>
      </main>
    );
  }

  if (!isCmsConfigured) {
    return (
      <main className={styles.page}>
        <section className={styles.setupPanel}>
          <p className={styles.script}>Cherelle Elisa</p>
          <h1>Beheeromgeving</h1>
          <p>
            De admin is gebouwd, maar de website heeft nog geen eigen Supabase-koppeling.
            Koppel eerst een project en voer <code>supabase/cherelle_admin.sql</code> uit.
          </p>
          <div className={styles.setupSteps}>
            <span>01</span><p>Maak of koppel het Supabaseproject voor cherelleelisa.nl.</p>
            <span>02</span><p>Voeg de publieke URL en publishable key toe aan Vercel.</p>
            <span>03</span><p>Maak Cherelle als Auth-gebruiker aan en voeg haar UUID toe aan <code>cherelle_admins</code>.</p>
          </div>
          <a className={styles.secondaryButton} href="/">Terug naar website</a>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className={styles.page}>
        <section className={styles.loginPanel}>
          <p className={styles.script}>Cherelle Elisa</p>
          <h1>Welkom terug</h1>
          <p className={styles.muted}>Log in om teksten, ervaringen en beelden te beheren.</p>
          <form onSubmit={handleLogin} className={styles.form}>
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
            {message && <div className={styles.notice}>{message}</div>}
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.primaryButton} type="submit" disabled={busy}>
              {busy ? "Inloggen…" : "Inloggen"}
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              disabled={busy}
              onClick={() => void handleActivation()}
            >
              Eerste keer? Account activeren
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.script}>Cherelle Elisa</p>
          <p className={styles.adminLabel}>Beheer</p>
        </div>

        <nav className={styles.nav} aria-label="Beheer navigatie">
          {([
            ["overzicht", "Overzicht"],
            ["teksten", "Teksten"],
            ["ervaringen", "Ervaringen"],
            ["beelden", "Beelden"],
          ] as Array<[AdminTab, string]>).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? styles.navActive : ""}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <a href="/" target="_blank" rel="noreferrer">Bekijk website ↗</a>
          <button type="button" onClick={logout}>Uitloggen</button>
        </div>
      </aside>

      <section className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Beheeromgeving</p>
            <h1>
              {tab === "overzicht" && "Overzicht"}
              {tab === "teksten" && "Teksten wijzigen"}
              {tab === "ervaringen" && "Ervaringen beheren"}
              {tab === "beelden" && "Beelden beheren"}
            </h1>
          </div>
          <div className={styles.account}>{session.user.email}</div>
        </header>

        {(message || error) && (
          <div className={error ? styles.noticeError : styles.notice}>
            {error || message}
          </div>
        )}

        {tab === "overzicht" && (
          <div className={styles.overview}>
            <div className={styles.statCard}>
              <span>Tekstsecties</span>
              <strong>{CONTENT_GROUPS.length}</strong>
              <p>Homepage-content in Nederlands en Engels.</p>
            </div>
            <div className={styles.statCard}>
              <span>Ervaringen</span>
              <strong>{publishedReviews}</strong>
              <p>{reviews.length} totaal opgeslagen.</p>
            </div>
            <div className={styles.statCard}>
              <span>Beelden</span>
              <strong>{Object.keys(media).length}</strong>
              <p>van {MEDIA_SLOTS.length} beelden vanuit de admin vervangen.</p>
            </div>

            <section className={styles.welcomeCard}>
              <p className={styles.script}>Een zachte plek om te beheren</p>
              <h2>De website aanpassen zonder in de techniek te hoeven.</h2>
              <p>
                Wijzig teksten per sectie, voeg ervaringen toe en vervang beelden.
                De huidige website-inhoud blijft altijd als veilige fallback bestaan.
              </p>
            </section>
          </div>
        )}

        {tab === "teksten" && (
          <div className={styles.stack}>
            {CONTENT_GROUPS.map((group) => (
              <section key={group.id} className={styles.editorCard}>
                <div className={styles.cardHeading}>
                  <div>
                    <p className={styles.eyebrow}>Homepage</p>
                    <h2>{group.title}</h2>
                  </div>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={busy}
                    onClick={() => void saveGroup(group.title, group.fields)}
                  >
                    Opslaan
                  </button>
                </div>

                <div className={styles.fields}>
                  {group.fields.map((key) => (
                    <div key={key} className={styles.fieldBlock}>
                      <label>{FIELD_LABELS[key] ?? key}</label>
                      <div className={styles.languageFields}>
                        <div>
                          <span>NL</span>
                          {isLongField(key) ? (
                            <textarea
                              rows={key.includes("body") ? 5 : 3}
                              value={content[key]?.nl ?? ""}
                              onChange={(event) => updateContent(key, "nl", event.target.value)}
                            />
                          ) : (
                            <input
                              value={content[key]?.nl ?? ""}
                              onChange={(event) => updateContent(key, "nl", event.target.value)}
                            />
                          )}
                        </div>
                        <div>
                          <span>EN</span>
                          {isLongField(key) ? (
                            <textarea
                              rows={key.includes("body") ? 5 : 3}
                              value={content[key]?.en ?? ""}
                              onChange={(event) => updateContent(key, "en", event.target.value)}
                            />
                          ) : (
                            <input
                              value={content[key]?.en ?? ""}
                              onChange={(event) => updateContent(key, "en", event.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === "ervaringen" && (
          <div className={styles.stack}>
            <div className={styles.sectionActions}>
              <p>Beheer de kaarten die in de sectie ‘Ervaringen’ op de homepage verschijnen.</p>
              <button className={styles.primaryButton} type="button" onClick={openNewReview}>
                + Ervaring toevoegen
              </button>
            </div>

            {editingReview && (
              <form className={styles.editorCard} onSubmit={handleReviewSave}>
                <div className={styles.cardHeading}>
                  <div>
                    <p className={styles.eyebrow}>{editingReview.id ? "Bewerken" : "Nieuw"}</p>
                    <h2>Ervaring</h2>
                  </div>
                  <button className={styles.textButton} type="button" onClick={() => setEditingReview(null)}>
                    Sluiten
                  </button>
                </div>

                <div className={styles.reviewFormGrid}>
                  <label>
                    <span>Naam</span>
                    <input
                      value={editingReview.name}
                      onChange={(event) => setEditingReview({ ...editingReview, name: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    <span>Volgorde</span>
                    <input
                      type="number"
                      value={editingReview.sort_order}
                      onChange={(event) => setEditingReview({ ...editingReview, sort_order: Number(event.target.value) })}
                    />
                  </label>
                  <label>
                    <span>Dienst / rol NL</span>
                    <input
                      value={editingReview.role_nl ?? ""}
                      onChange={(event) => setEditingReview({ ...editingReview, role_nl: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Dienst / rol EN</span>
                    <input
                      value={editingReview.role_en ?? ""}
                      onChange={(event) => setEditingReview({ ...editingReview, role_en: event.target.value })}
                    />
                  </label>
                  <label className={styles.fullField}>
                    <span>Ervaring NL</span>
                    <textarea
                      rows={5}
                      value={editingReview.quote_nl}
                      onChange={(event) => setEditingReview({ ...editingReview, quote_nl: event.target.value })}
                      required
                    />
                  </label>
                  <label className={styles.fullField}>
                    <span>Ervaring EN</span>
                    <textarea
                      rows={5}
                      value={editingReview.quote_en}
                      onChange={(event) => setEditingReview({ ...editingReview, quote_en: event.target.value })}
                    />
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editingReview.is_published}
                      onChange={(event) => setEditingReview({ ...editingReview, is_published: event.target.checked })}
                    />
                    <span>Direct zichtbaar op de website</span>
                  </label>
                </div>

                <button className={styles.primaryButton} type="submit" disabled={busy}>
                  {busy ? "Opslaan…" : "Ervaring opslaan"}
                </button>
              </form>
            )}

            <div className={styles.reviewList}>
              {reviews.length === 0 && (
                <div className={styles.emptyState}>Nog geen ervaringen toegevoegd.</div>
              )}
              {reviews.map((review) => (
                <article key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewMeta}>
                    <span>{review.is_published ? "Zichtbaar" : "Verborgen"}</span>
                    <span>#{review.sort_order}</span>
                  </div>
                  <blockquote>“{review.quote_nl}”</blockquote>
                  <strong>{review.name}</strong>
                  {review.role_nl && <p>{review.role_nl}</p>}
                  <div className={styles.reviewActions}>
                    <button type="button" onClick={() => openExistingReview(review)}>Wijzigen</button>
                    <button type="button" onClick={() => void handleReviewDelete(review)}>Verwijderen</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "beelden" && (
          <div className={styles.mediaGrid}>
            {MEDIA_SLOTS.map((item) => {
              const current = media[item.slot];
              return (
                <MediaCard
                  key={item.slot}
                  slot={item.slot}
                  label={item.label}
                  preview={current?.public_url || item.fallback}
                  initialAltNl={current?.alt_nl || ""}
                  initialAltEn={current?.alt_en || ""}
                  busy={uploadingSlot === item.slot}
                  onUpload={handleMediaUpload}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function MediaCard({
  slot,
  label,
  preview,
  initialAltNl,
  initialAltEn,
  busy,
  onUpload,
}: {
  slot: string;
  label: string;
  preview: string;
  initialAltNl: string;
  initialAltEn: string;
  busy: boolean;
  onUpload: (slot: string, file: File, altNl: string, altEn: string) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [altNl, setAltNl] = useState(initialAltNl);
  const [altEn, setAltEn] = useState(initialAltEn);

  useEffect(() => {
    setAltNl(initialAltNl);
    setAltEn(initialAltEn);
  }, [initialAltNl, initialAltEn]);

  return (
    <article className={styles.mediaCard}>
      <div className={styles.mediaPreview}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="" />
      </div>
      <div className={styles.mediaBody}>
        <p className={styles.eyebrow}>Beeld</p>
        <h2>{label}</h2>
        <label className={styles.fileLabel}>
          <span>{file ? file.name : "Nieuwe foto kiezen"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <label>
          <span>Alt-tekst NL</span>
          <input value={altNl} onChange={(event) => setAltNl(event.target.value)} />
        </label>
        <label>
          <span>Alt-tekst EN</span>
          <input value={altEn} onChange={(event) => setAltEn(event.target.value)} />
        </label>
        <button
          className={styles.primaryButton}
          type="button"
          disabled={!file || busy}
          onClick={() => file && void onUpload(slot, file, altNl, altEn)}
        >
          {busy ? "Uploaden…" : "Foto vervangen"}
        </button>
      </div>
    </article>
  );
}
