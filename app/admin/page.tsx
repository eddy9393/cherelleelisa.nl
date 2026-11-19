"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  clearAccountSession,
  clearCmsSession,
  CherelleAdminEvent,
  CherelleClient,
  CherelleClientMessage,
  CherelleDashboardMetrics,
  CherelleIntake,
  CherelleNewsletterLog,
  CmsContentMap,
  CmsMedia,
  CmsReview,
  CmsSession,
  CONTENT_GROUPS,
  DEFAULT_HOMEPAGE_CONTENT,
  downloadClientIntakePdf,
  getSavedCmsSession,
  inviteClient,
  isCmsConfigured,
  loadAdminClients,
  loadAdminCms,
  loadAdminDashboard,
  loadAdminIntake,
  loadClientMessages,
  loadNewsletterHistory,
  loginCms,
  signupCms,
  MEDIA_SLOTS,
  markAdminEventsRead,
  saveContentGroup,
  saveReview,
  sendClientMessage,
  sendNewsletter,
  deleteMedia,
  deleteReview,
  uploadMedia,
  verifyCmsSession,
} from "../../lib/cherelleCms";
import styles from "./admin.module.css";

type AdminTab = "overzicht" | "website" | "klanten" | "nieuwsbrief" | "ervaringen" | "teksten" | "beelden";

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

function formatAdminDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function yesNoAdmin(value: boolean | null) {
  if (value === null) return "—";
  return value ? "Ja" : "Nee";
}

function energyLevelAdmin(value: CherelleIntake["energy_experience_level"]) {
  if (value === "none") return "Geen ervaring";
  if (value === "basic") return "Basiservaring";
  if (value === "advanced") return "Gevorderd";
  return "—";
}

export default function CherelleAdminPage() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<CmsSession | null>(null);
  const [tab, setTab] = useState<AdminTab>("overzicht");
  const [content, setContent] = useState<CmsContentMap>({ ...DEFAULT_HOMEPAGE_CONTENT });
  const [reviews, setReviews] = useState<CmsReview[]>([]);
  const [media, setMedia] = useState<Record<string, CmsMedia>>({});
  const [clients, setClients] = useState<CherelleClient[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<CherelleDashboardMetrics>({
    clients_total: 0,
    clients_active: 0,
    visitors_today: 0,
    visitors_7d: 0,
    visitors_30d: 0,
    page_views_today: 0,
    unread_activity: 0,
  });
  const [adminEvents, setAdminEvents] = useState<CherelleAdminEvent[]>([]);
  const [newsletters, setNewsletters] = useState<CherelleNewsletterLog[]>([]);
  const [selectedClient, setSelectedClient] = useState<CherelleClient | null>(null);
  const [selectedIntake, setSelectedIntake] = useState<CherelleIntake | null>(null);
  const [selectedClientMessages, setSelectedClientMessages] = useState<CherelleClientMessage[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientBusy, setClientBusy] = useState(false);
  const [clientDetailLoading, setClientDetailLoading] = useState(false);
  const [clientMessageSubject, setClientMessageSubject] = useState("");
  const [clientMessageBody, setClientMessageBody] = useState("");
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterBody, setNewsletterBody] = useState("");
  const [newsletterRecipients, setNewsletterRecipients] = useState<string[]>([]);
  const [newsletterBusy, setNewsletterBusy] = useState(false);

  const [email, setEmail] = useState("info@cherelleelisa.nl");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingReview, setEditingReview] = useState<(Omit<CmsReview, "id"> & { id?: string }) | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingMediaSlot, setEditingMediaSlot] = useState<string | null>(null);
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
        const [data, clientRows, dashboard, newsletterRows] = await Promise.all([
          loadAdminCms(saved),
          loadAdminClients(saved),
          loadAdminDashboard(saved),
          loadNewsletterHistory(saved),
        ]);
        if (!active) return;
        setSession(saved);
        setContent(data.content);
        setReviews(data.reviews);
        setMedia(data.media);
        setClients(clientRows);
        setDashboardMetrics(dashboard.metrics);
        setAdminEvents(dashboard.events);
        setNewsletters(newsletterRows);
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

  useEffect(() => {
    if (!session || tab !== "overzicht") return;

    let active = true;
    void loadAdminDashboard(session)
      .then((dashboard) => {
        if (!active) return;
        setDashboardMetrics(dashboard.metrics);
        setAdminEvents(dashboard.events);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [session, tab]);

  async function reload(nextSession = session) {
    if (!nextSession) return;
    const [data, clientRows, dashboard, newsletterRows] = await Promise.all([
      loadAdminCms(nextSession),
      loadAdminClients(nextSession),
      loadAdminDashboard(nextSession),
      loadNewsletterHistory(nextSession),
    ]);
    setContent(data.content);
    setReviews(data.reviews);
    setMedia(data.media);
    setClients(clientRows);
    setDashboardMetrics(dashboard.metrics);
    setAdminEvents(dashboard.events);
    setNewsletters(newsletterRows);
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
    clearAccountSession();
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

  async function handleClientInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const name = clientName.trim();
    const emailAddress = clientEmail.trim().toLowerCase();
    if (!name || !emailAddress) {
      setError("Vul de naam en het e-mailadres van de klant in.");
      return;
    }

    setClientBusy(true);
    setError("");
    setMessage("");

    try {
      await inviteClient(session, name, emailAddress, "invite");
      const clientRows = await loadAdminClients(session);
      setClients(clientRows);
      setClientName("");
      setClientEmail("");
      setMessage(`Uitnodiging is verstuurd naar ${emailAddress}.`);
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Klant kon niet worden uitgenodigd.");
    } finally {
      setClientBusy(false);
    }
  }

  async function handleClientResend(client: CherelleClient) {
    if (!session) return;
    setClientBusy(true);
    setError("");
    setMessage("");

    try {
      await inviteClient(session, client.name, client.email, "resend");
      const clientRows = await loadAdminClients(session);
      setClients(clientRows);
      setMessage(`Nieuwe uitnodiging is verstuurd naar ${client.email}.`);
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Uitnodiging kon niet opnieuw worden verstuurd.");
    } finally {
      setClientBusy(false);
    }
  }

  async function openClientDetails(client: CherelleClient) {
    if (!session) return;
    setSelectedClient(client);
    setSelectedIntake(null);
    setSelectedClientMessages([]);
    setClientMessageSubject("");
    setClientMessageBody("");
    setClientDetailLoading(true);
    setError("");

    try {
      const [intake, messageRows] = await Promise.all([
        loadAdminIntake(session, client.id),
        loadClientMessages(session, client.id),
      ]);
      setSelectedIntake(intake);
      setSelectedClientMessages(messageRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Klantgegevens konden niet worden geladen.");
    } finally {
      setClientDetailLoading(false);
    }
  }

  async function handleClientPdfDownload(client: CherelleClient) {
    if (!session) return;
    setClientBusy(true);
    setError("");
    setMessage("");

    try {
      const blob = await downloadClientIntakePdf(session, client.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "intake.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setMessage(`PDF van ${client.name} is aangemaakt.`);
    } catch (pdfError) {
      setError(pdfError instanceof Error ? pdfError.message : "PDF kon niet worden aangemaakt.");
    } finally {
      setClientBusy(false);
    }
  }

  async function handleClientMessageSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !selectedClient) return;

    const subject = clientMessageSubject.trim();
    const body = clientMessageBody.trim();
    if (!subject || !body) {
      setError("Vul een onderwerp en bericht in.");
      return;
    }

    setClientBusy(true);
    setError("");
    setMessage("");

    try {
      await sendClientMessage(session, selectedClient.id, subject, body);
      const messageRows = await loadClientMessages(session, selectedClient.id);
      setSelectedClientMessages(messageRows);
      setClientMessageSubject("");
      setClientMessageBody("");
      setMessage(`Bericht voor ${selectedClient.name} is opgeslagen.`);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Bericht kon niet worden opgeslagen.");
    } finally {
      setClientBusy(false);
    }
  }

  async function handleMarkActivityRead() {
    if (!session) return;
    setBusy(true);
    setError("");

    try {
      await markAdminEventsRead(session);
      const dashboard = await loadAdminDashboard(session);
      setDashboardMetrics(dashboard.metrics);
      setAdminEvents(dashboard.events);
      setMessage("Nieuwe klantactiviteit is als gelezen gemarkeerd.");
    } catch (activityError) {
      setError(activityError instanceof Error ? activityError.message : "Activiteit kon niet worden bijgewerkt.");
    } finally {
      setBusy(false);
    }
  }

  function toggleNewsletterRecipient(clientId: string) {
    setNewsletterRecipients((current) =>
      current.includes(clientId)
        ? current.filter((id) => id !== clientId)
        : [...current, clientId]
    );
  }

  function selectAllNewsletterRecipients() {
    setNewsletterRecipients(clients.map((client) => client.id));
  }

  async function handleNewsletterSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const subject = newsletterSubject.trim();
    const body = newsletterBody.trim();
    if (!subject || !body || newsletterRecipients.length === 0) {
      setError("Vul een onderwerp en bericht in en selecteer minimaal één ontvanger.");
      return;
    }

    if (!window.confirm(`Nieuwsbrief versturen naar ${newsletterRecipients.length} geselecteerde klant${newsletterRecipients.length === 1 ? "" : "en"}?`)) {
      return;
    }

    setNewsletterBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await sendNewsletter(session, subject, body, newsletterRecipients);
      const history = await loadNewsletterHistory(session);
      setNewsletters(history);
      setNewsletterSubject("");
      setNewsletterBody("");
      setNewsletterRecipients([]);
      setMessage(`Nieuwsbrief is verstuurd naar ${result.sent} klant${result.sent === 1 ? "" : "en"}.`);
    } catch (newsletterError) {
      setError(newsletterError instanceof Error ? newsletterError.message : "Nieuwsbrief kon niet worden verstuurd.");
    } finally {
      setNewsletterBusy(false);
    }
  }

  function openNewReview() {
    const nextSort = reviews.length ? Math.max(...reviews.map((review) => review.sort_order)) + 1 : 0;
    setEditingGroupId(null);
    setEditingMediaSlot(null);
    setEditingReview(emptyReview(nextSort));
  }

  function openExistingReview(review: CmsReview) {
    setEditingGroupId(null);
    setEditingMediaSlot(null);
    setEditingReview({ ...review });
  }

  function openGroupEditor(groupId: string) {
    setEditingReview(null);
    setEditingMediaSlot(null);
    setEditingGroupId(groupId);
  }

  function openMediaEditor(slot: string) {
    setEditingReview(null);
    setEditingGroupId(null);
    setEditingMediaSlot(slot);
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

  async function handleMediaDelete(slot: string) {
    if (!session || !media[slot]) return;
    if (!window.confirm("Eigen geüploade foto verwijderen en de oorspronkelijke websitefoto terugzetten?")) return;

    setUploadingSlot(slot);
    setError("");
    setMessage("");
    try {
      await deleteMedia(session, media[slot]);
      setMedia((current) => {
        const next = { ...current };
        delete next[slot];
        return next;
      });
      setMessage("Eigen foto is verwijderd. De oorspronkelijke websitefoto wordt weer gebruikt.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Foto verwijderen is mislukt.");
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
          <p className={styles.muted}>Log in om de website, klanten en communicatie te beheren.</p>
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

  const activeGroup = CONTENT_GROUPS.find((group) => group.id === editingGroupId) ?? null;
  const activeMediaConfig = MEDIA_SLOTS.find((item) => item.slot === editingMediaSlot) ?? null;
  const mediaPreview = (slot: string, fallback: string) => media[slot]?.public_url || fallback;

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
            ["website", "Website bewerken"],
            ["klanten", "Klanten"],
            ["nieuwsbrief", "Nieuwsbrief"],
            ["ervaringen", "Ervaringen"],
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
              {tab === "website" && "Website bewerken"}
              {tab === "klanten" && "Klanten"}
              {tab === "nieuwsbrief" && "Nieuwsbrief"}
              {tab === "ervaringen" && "Ervaringen beheren"}
              {tab === "teksten" && "Teksten wijzigen"}
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

        {tab === "klanten" && (
          <div className={styles.clientsAdmin}>
            <section className={styles.clientInviteCard}>
              <div>
                <p className={styles.eyebrow}>Nieuwe klant</p>
                <h2>Koppel een persoonlijke omgeving.</h2>
                <p>
                  Vul alleen de naam en het e-mailadres in. De klant ontvangt daarna automatisch een persoonlijke
                  uitnodiging en maakt zelf bij de eerste keer een wachtwoord aan.
                </p>
              </div>

              <form className={styles.clientInviteForm} onSubmit={handleClientInvite}>
                <label>
                  <span>Naam</span>
                  <input
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="Voor- en achternaam"
                    required
                  />
                </label>
                <label>
                  <span>E-mailadres</span>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(event) => setClientEmail(event.target.value)}
                    placeholder="naam@voorbeeld.nl"
                    required
                  />
                </label>
                <button className={styles.primaryButton} type="submit" disabled={clientBusy}>
                  {clientBusy ? "Uitnodigen…" : "Klant uitnodigen"}
                </button>
              </form>
            </section>

            <div className={styles.clientAdminGrid}>
              <section className={styles.clientListPanel}>
                <div className={styles.clientPanelHead}>
                  <div>
                    <p className={styles.eyebrow}>Klanten</p>
                    <h2>{clients.length} {clients.length === 1 ? "klant" : "klanten"}</h2>
                  </div>
                </div>

                <div className={styles.clientList}>
                  {clients.length === 0 && (
                    <div className={styles.emptyState}>Nog geen klantaccounts gekoppeld.</div>
                  )}

                  {clients.map((client) => (
                    <article
                      key={client.id}
                      className={`${styles.clientListItem} ${selectedClient?.id === client.id ? styles.clientListItemActive : ""}`}
                    >
                      <button type="button" className={styles.clientListMain} onClick={() => void openClientDetails(client)}>
                        <span className={styles.clientAvatar}>{client.name.trim().slice(0, 1).toUpperCase()}</span>
                        <span>
                          <strong>{client.name}</strong>
                          <small>{client.email}</small>
                        </span>
                        <span
                          className={`${styles.clientStatus} ${
                            client.status === "active" ? styles.clientStatusActive : styles.clientStatusInvited
                          }`}
                        >
                          {client.status === "active"
                            ? "Actief"
                            : client.status === "completed"
                              ? "Afgerond"
                              : client.status === "archived"
                                ? "Gearchiveerd"
                                : "Uitgenodigd"}
                        </span>
                      </button>

                      {!client.activated_at && (
                        <button
                          type="button"
                          className={styles.clientResendButton}
                          disabled={clientBusy}
                          onClick={() => void handleClientResend(client)}
                        >
                          Opnieuw uitnodigen
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              <aside className={styles.clientDetailPanel}>
                {!selectedClient && (
                  <div className={styles.clientDetailEmpty}>
                    <p className={styles.script}>persoonlijk</p>
                    <h2>Kies een klant.</h2>
                    <p>De intake wordt pas geladen wanneer je bewust een klant opent.</p>
                  </div>
                )}

                {selectedClient && (
                  <>
                    <div className={styles.clientDetailHead}>
                      <div>
                        <p className={styles.eyebrow}>Klantprofiel</p>
                        <h2>{selectedClient.name}</h2>
                        <p>{selectedClient.email}</p>
                      </div>
                      <div className={styles.clientDetailActions}>
                        <button
                          className={styles.secondaryButton}
                          type="button"
                          disabled={clientBusy || !selectedIntake}
                          onClick={() => void handleClientPdfDownload(selectedClient)}
                        >
                          Intake als PDF
                        </button>
                        <button
                          className={styles.textButton}
                          type="button"
                          onClick={() => {
                            setSelectedClient(null);
                            setSelectedIntake(null);
                            setSelectedClientMessages([]);
                            setClientMessageSubject("");
                            setClientMessageBody("");
                          }}
                        >
                          Sluiten
                        </button>
                      </div>
                    </div>

                    <div className={styles.clientDetailMeta}>
                      <div>
                        <span>Status</span>
                        <strong>{selectedClient.activated_at ? "Account actief" : "Uitnodiging verstuurd"}</strong>
                      </div>
                      <div>
                        <span>Uitgenodigd</span>
                        <strong>{formatAdminDate(selectedClient.invited_at)}</strong>
                      </div>
                      <div>
                        <span>Geactiveerd</span>
                        <strong>{formatAdminDate(selectedClient.activated_at)}</strong>
                      </div>
                    </div>

                    <section className={styles.clientMessageAdmin}>
                      <div className={styles.clientMessageAdminHead}>
                        <div>
                          <p className={styles.eyebrow}>Persoonlijk bericht</p>
                          <h3>Schrijf iets voor {selectedClient.name.split(" ")[0]}.</h3>
                        </div>
                      </div>

                      <form className={styles.clientMessageForm} onSubmit={handleClientMessageSend}>
                        <label>
                          <span>Onderwerp</span>
                          <input
                            value={clientMessageSubject}
                            onChange={(event) => setClientMessageSubject(event.target.value)}
                            placeholder="Bijvoorbeeld: Voor jouw sessie"
                            required
                          />
                        </label>
                        <label>
                          <span>Bericht</span>
                          <textarea
                            rows={5}
                            value={clientMessageBody}
                            onChange={(event) => setClientMessageBody(event.target.value)}
                            placeholder="Schrijf hier je persoonlijke bericht..."
                            required
                          />
                        </label>
                        <button className={styles.primaryButton} type="submit" disabled={clientBusy}>
                          {clientBusy ? "Opslaan…" : "Bericht plaatsen"}
                        </button>
                      </form>

                      {selectedClientMessages.length > 0 && (
                        <div className={styles.clientSentMessages}>
                          <p className={styles.eyebrow}>Eerder geplaatst</p>
                          {selectedClientMessages.slice(0, 4).map((item) => (
                            <article key={item.id}>
                              <div>
                                <strong>{item.subject}</strong>
                                <span>{formatAdminDate(item.created_at)}</span>
                              </div>
                              <p>{item.body}</p>
                              <small>{item.read_at ? "Gelezen door klant" : "Nog niet gelezen"}</small>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>

                    {clientDetailLoading ? (
                      <div className={styles.clientIntakeLoading}>Intake laden…</div>
                    ) : !selectedIntake ? (
                      <div className={styles.clientNoIntake}>
                        <p className={styles.eyebrow}>Intake</p>
                        <h3>Nog niet ingevuld.</h3>
                        <p>De klant heeft nog geen antwoorden opgeslagen.</p>
                      </div>
                    ) : (
                      <div className={styles.clientIntakeView}>
                        <div className={styles.clientIntakeViewHead}>
                          <div>
                            <p className={styles.eyebrow}>Intake</p>
                            <h3>{selectedIntake.submitted_at ? "Ingeleverd" : "Concept opgeslagen"}</h3>
                          </div>
                          <span>{formatAdminDate(selectedIntake.submitted_at || selectedIntake.updated_at)}</span>
                        </div>

                        <section>
                          <h4>Persoonlijke gegevens</h4>
                          <AdminIntakeRow label="Geboortedatum" value={selectedIntake.birth_date ? formatAdminDate(selectedIntake.birth_date) : "—"} />
                          <AdminIntakeRow label="Telefoonnummer" value={selectedIntake.phone || "—"} />
                        </section>

                        <section>
                          <h4>Intentie & ervaring</h4>
                          <AdminIntakeRow label="Intentie" value={selectedIntake.intention || "—"} multiline />
                          <AdminIntakeRow label="Ervaring energiewerk" value={energyLevelAdmin(selectedIntake.energy_experience_level)} />
                          <AdminIntakeRow
                            label="Intense energetische ervaringen"
                            value={yesNoAdmin(selectedIntake.intense_energy_experience)}
                            detail={selectedIntake.intense_energy_details}
                          />
                        </section>

                        <section>
                          <h4>Gezondheid & medische achtergrond</h4>
                          <AdminIntakeRow
                            label="Fysieke klachten / aandoeningen"
                            value={yesNoAdmin(selectedIntake.physical_conditions)}
                            detail={selectedIntake.physical_conditions_details}
                          />
                          <AdminIntakeRow
                            label="Medicijnen / supplementen"
                            value={yesNoAdmin(selectedIntake.medications)}
                            detail={selectedIntake.medications_details}
                          />
                          <AdminIntakeRow
                            label="Meditatie, yoga of ademwerk"
                            value={yesNoAdmin(selectedIntake.meditation_breathwork_experience)}
                            detail={selectedIntake.meditation_breathwork_details}
                          />
                          <AdminIntakeRow
                            label="Psychische klachten / trauma"
                            value={yesNoAdmin(selectedIntake.mental_health_or_trauma)}
                            detail={selectedIntake.mental_health_or_trauma_details}
                          />
                          <AdminIntakeRow
                            label="Stimulerende middelen"
                            value={yesNoAdmin(selectedIntake.stimulants)}
                            detail={selectedIntake.stimulants_details}
                          />
                        </section>

                        <section>
                          <h4>Bevestiging</h4>
                          <AdminIntakeRow
                            label="Contra-indicaties doorgenomen"
                            value={selectedIntake.contraindications_acknowledged ? "Ja" : "Nee"}
                          />
                          <AdminIntakeRow
                            label="Verklaring bevestigd"
                            value={selectedIntake.declaration_accepted ? "Ja" : "Nee"}
                          />
                          <AdminIntakeRow label="Digitale handtekening" value={selectedIntake.signature_name || "—"} />
                          <AdminIntakeRow
                            label="Datum ondertekening"
                            value={selectedIntake.signature_date ? formatAdminDate(selectedIntake.signature_date) : "—"}
                          />
                        </section>
                      </div>
                    )}
                  </>
                )}
              </aside>
            </div>
          </div>
        )}

        {tab === "website" && (
          <div className={styles.websiteEditorLayout}>
            <div className={styles.websitePreviewShell}>
              <div className={styles.previewBrowserBar}>
                <div>
                  <span />
                  <span />
                  <span />
                </div>
                <strong>cherelleelisa.nl</strong>
                <a href="/" target="_blank" rel="noreferrer">Open website ↗</a>
              </div>

              <div className={styles.sitePreview}>
                <section className={`${styles.previewSection} ${styles.previewHero}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaPreview("hero", "/HeroCherelle.webp")} alt="" className={styles.previewHeroImage} />
                  <div className={styles.previewHeroVeil} />
                  <div className={styles.previewHeroCopy}>
                    <p>{content.hero_sentence_1?.nl}</p>
                    <h2>{content.hero_sentence_2?.nl}</h2>
                    <span>{content.hero_subtitle?.nl}</span>
                  </div>
                  <div className={styles.previewControls}>
                    <button type="button" onClick={() => openGroupEditor("hero")}>Tekst wijzigen</button>
                    <button type="button" onClick={() => openMediaEditor("hero")}>Foto wijzigen</button>
                  </div>
                </section>

                <div className={styles.previewQuote}>{content.quote_bar?.nl}</div>

                <section className={`${styles.previewSection} ${styles.previewSplit}`}>
                  <div className={styles.previewText}>
                    <p className={styles.previewKicker}>{content.recognition_kicker?.nl}</p>
                    <h2>{content.recognition_title?.nl}</h2>
                    <p>{content.recognition_body?.nl}</p>
                    <strong>{content.recognition_emphasis?.nl}</strong>
                  </div>
                  <div className={styles.previewImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaPreview("recognition", "/Herkenning.jpg")} alt="" />
                  </div>
                  <div className={styles.previewControls}>
                    <button type="button" onClick={() => openGroupEditor("recognition")}>Tekst wijzigen</button>
                    <button type="button" onClick={() => openMediaEditor("recognition")}>Foto wijzigen</button>
                  </div>
                </section>

                <section className={`${styles.previewSection} ${styles.previewSplit} ${styles.previewWarm}`}>
                  <div className={styles.previewImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaPreview("homecoming", "/Thuiskomen.jpg")} alt="" />
                  </div>
                  <div className={styles.previewText}>
                    <p className={styles.previewKicker}>{content.homecoming_kicker?.nl}</p>
                    <h2>{content.homecoming_title?.nl}</h2>
                    <p>{content.homecoming_body?.nl}</p>
                  </div>
                  <div className={styles.previewControls}>
                    <button type="button" onClick={() => openGroupEditor("homecoming")}>Tekst wijzigen</button>
                    <button type="button" onClick={() => openMediaEditor("homecoming")}>Foto wijzigen</button>
                  </div>
                </section>

                <section className={`${styles.previewSection} ${styles.previewGuidance}`}>
                  <div className={styles.previewText}>
                    <p className={styles.previewKicker}>{content.guidance_kicker?.nl}</p>
                    <h2>{content.guidance_title?.nl}</h2>
                  </div>
                  <div className={styles.previewServiceGrid}>
                    {[
                      ["guidance_feminine", "/feminine.jpg", content.guidance_1_title?.nl, content.guidance_1_body?.nl],
                      ["guidance_1to1", "/1-op-1.jpg", content.guidance_2_title?.nl, content.guidance_2_body?.nl],
                      ["guidance_ceremonies", "/ceremonies.webp", content.guidance_3_title?.nl, content.guidance_3_body?.nl],
                    ].map(([slot, fallback, title, body]) => (
                      <article key={String(slot)}>
                        <div className={styles.previewServiceImage}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mediaPreview(String(slot), String(fallback))} alt="" />
                          <button type="button" onClick={() => openMediaEditor(String(slot))}>Foto wijzigen</button>
                        </div>
                        <h3>{title}</h3>
                        <p>{body}</p>
                      </article>
                    ))}
                  </div>
                  <div className={styles.previewControls}>
                    <button type="button" onClick={() => openGroupEditor("guidance")}>Teksten wijzigen</button>
                  </div>
                </section>

                <section className={`${styles.previewSection} ${styles.previewSplit} ${styles.previewMethod}`}>
                  <div className={styles.previewImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaPreview("approach", "/Werkwijze.png")} alt="" />
                  </div>
                  <div className={styles.previewText}>
                    <p className={styles.previewKicker}>{content.approach_kicker?.nl}</p>
                    <p>{content.approach_body?.nl}</p>
                    <h2>{content.approach_emphasis?.nl}</h2>
                    <small>{content.approach_note?.nl}</small>
                  </div>
                  <div className={styles.previewControls}>
                    <button type="button" onClick={() => openGroupEditor("approach")}>Tekst wijzigen</button>
                    <button type="button" onClick={() => openMediaEditor("approach")}>Foto wijzigen</button>
                  </div>
                </section>

                <section className={`${styles.previewSection} ${styles.previewReviews}`}>
                  <div className={styles.previewReviewsHead}>
                    <div>
                      <p className={styles.previewKicker}>{content.reviews_kicker?.nl}</p>
                      <h2>{content.reviews_title?.nl}</h2>
                    </div>
                    <button type="button" className={styles.previewAddButton} onClick={openNewReview}>+ Ervaring toevoegen</button>
                  </div>
                  <div className={styles.previewReviewGrid}>
                    {reviews.length === 0 ? (
                      <p className={styles.previewEmpty}>Nog geen ervaringen toegevoegd.</p>
                    ) : (
                      reviews.map((review) => (
                        <article key={review.id}>
                          <blockquote>“{review.quote_nl}”</blockquote>
                          <strong>{review.name}</strong>
                          <div>
                            <button type="button" onClick={() => openExistingReview(review)}>Wijzigen</button>
                            <button type="button" onClick={() => void handleReviewDelete(review)}>Verwijderen</button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                  <div className={styles.previewControls}>
                    <button type="button" onClick={() => openGroupEditor("reviews")}>Koptekst wijzigen</button>
                  </div>
                </section>

                <section className={`${styles.previewSection} ${styles.previewSplit}`}>
                  <div className={styles.previewImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaPreview("about", "/Overmij.webp")} alt="" />
                  </div>
                  <div className={styles.previewText}>
                    <p className={styles.previewKicker}>{content.about_kicker?.nl}</p>
                    <h2>{content.about_title?.nl}</h2>
                    <p>{content.about_body_1?.nl}</p>
                    <p>{content.about_body_2?.nl}</p>
                  </div>
                  <div className={styles.previewControls}>
                    <button type="button" onClick={() => openGroupEditor("about")}>Tekst wijzigen</button>
                    <button type="button" onClick={() => openMediaEditor("about")}>Foto wijzigen</button>
                  </div>
                </section>

                <section className={`${styles.previewSection} ${styles.previewSplit} ${styles.previewInvitation}`}>
                  <div className={styles.previewImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaPreview("invitation", "/Uitnodiging.webp")} alt="" />
                  </div>
                  <div className={styles.previewText}>
                    <p className={styles.previewKicker}>{content.invitation_kicker?.nl}</p>
                    <h2>{content.invitation_title?.nl}</h2>
                    <p>{content.invitation_body?.nl}</p>
                    <span className={styles.previewFakeButton}>Plan een kennismaking</span>
                  </div>
                  <div className={styles.previewControls}>
                    <button type="button" onClick={() => openGroupEditor("invitation")}>Tekst wijzigen</button>
                    <button type="button" onClick={() => openMediaEditor("invitation")}>Foto wijzigen</button>
                  </div>
                </section>
              </div>
            </div>

            <aside className={styles.liveEditorPanel}>
              {!activeGroup && !activeMediaConfig && !editingReview && (
                <div className={styles.editorWelcome}>
                  <p className={styles.script}>Website bewerken</p>
                  <h2>Klik op een onderdeel in de voorbeeldwebsite.</h2>
                  <p>
                    De bewerking verschijnt hier. Na opslaan wordt de wijziging direct door de website gebruikt.
                  </p>
                </div>
              )}

              {activeGroup && (
                <section className={styles.liveEditorCard}>
                  <div className={styles.cardHeading}>
                    <div>
                      <p className={styles.eyebrow}>Teksten</p>
                      <h2>{activeGroup.title}</h2>
                    </div>
                    <button className={styles.textButton} type="button" onClick={() => setEditingGroupId(null)}>Sluiten</button>
                  </div>
                  <div className={styles.fields}>
                    {activeGroup.fields.map((key) => (
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
                  <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={busy}
                    onClick={() => void saveGroup(activeGroup.title, activeGroup.fields)}
                  >
                    {busy ? "Opslaan…" : "Wijzigingen opslaan"}
                  </button>
                </section>
              )}

              {activeMediaConfig && (
                <div className={styles.liveEditorCard}>
                  <div className={styles.cardHeading}>
                    <div>
                      <p className={styles.eyebrow}>Foto</p>
                      <h2>{activeMediaConfig.label}</h2>
                    </div>
                    <button className={styles.textButton} type="button" onClick={() => setEditingMediaSlot(null)}>Sluiten</button>
                  </div>
                  <MediaCard
                    slot={activeMediaConfig.slot}
                    label={activeMediaConfig.label}
                    preview={media[activeMediaConfig.slot]?.public_url || activeMediaConfig.fallback}
                    initialAltNl={media[activeMediaConfig.slot]?.alt_nl || ""}
                    initialAltEn={media[activeMediaConfig.slot]?.alt_en || ""}
                    busy={uploadingSlot === activeMediaConfig.slot}
                    canDelete={Boolean(media[activeMediaConfig.slot])}
                    onUpload={handleMediaUpload}
                    onDelete={handleMediaDelete}
                  />
                </div>
              )}

              {editingReview && (
                <form className={styles.liveEditorCard} onSubmit={handleReviewSave}>
                  <div className={styles.cardHeading}>
                    <div>
                      <p className={styles.eyebrow}>{editingReview.id ? "Ervaring wijzigen" : "Nieuwe ervaring"}</p>
                      <h2>Ervaring</h2>
                    </div>
                    <button className={styles.textButton} type="button" onClick={() => setEditingReview(null)}>Sluiten</button>
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
                    <label className={styles.fullField}>
                      <span>Ervaring NL</span>
                      <textarea
                        rows={6}
                        value={editingReview.quote_nl}
                        onChange={(event) => setEditingReview({ ...editingReview, quote_nl: event.target.value })}
                        required
                      />
                    </label>
                    <label className={styles.fullField}>
                      <span>Ervaring EN</span>
                      <textarea
                        rows={6}
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
                      <span>Zichtbaar op de website</span>
                    </label>
                  </div>
                  <button className={styles.primaryButton} type="submit" disabled={busy}>
                    {busy ? "Opslaan…" : "Ervaring opslaan"}
                  </button>
                </form>
              )}
            </aside>
          </div>
        )}

        {tab === "overzicht" && (
          <div className={styles.dashboardOverview}>
            <div className={styles.overviewIntro}>
              <p className={styles.script}>Een zachte plek om te beheren</p>
            </div>

            <div className={styles.overviewMetrics}>
              <article>
                <span>Klanten</span>
                <strong>{dashboardMetrics.clients_total}</strong>
                <p>{dashboardMetrics.clients_active} actieve accounts</p>
              </article>
              <article>
                <span>Bezoekers vandaag</span>
                <strong>{dashboardMetrics.visitors_today}</strong>
                <p>{dashboardMetrics.page_views_today} paginaweergaven vandaag</p>
              </article>
              <article>
                <span>Laatste 7 dagen</span>
                <strong>{dashboardMetrics.visitors_7d}</strong>
                <p>unieke bezoekers</p>
              </article>
              <article>
                <span>Laatste 30 dagen</span>
                <strong>{dashboardMetrics.visitors_30d}</strong>
                <p>unieke bezoekers</p>
              </article>
            </div>

            <section className={styles.activityPanel}>
              <div className={styles.activityHead}>
                <div>
                  <p className={styles.eyebrow}>Klantactiviteit</p>
                  <h2>Wat is er nieuw?</h2>
                </div>
                {dashboardMetrics.unread_activity > 0 && (
                  <button type="button" className={styles.textButton} onClick={() => void handleMarkActivityRead()}>
                    Alles gelezen
                  </button>
                )}
              </div>

              {adminEvents.length === 0 ? (
                <div className={styles.activityEmpty}>Nog geen nieuwe klantactiviteit.</div>
              ) : (
                <div className={styles.activityList}>
                  {adminEvents.map((event) => (
                    <article key={event.id} className={!event.read_at ? styles.activityUnread : ""}>
                      <span className={styles.activityDot} />
                      <div>
                        <strong>{event.title}</strong>
                        <small>{formatAdminDate(event.created_at)}</small>
                      </div>
                      {!event.read_at && <span className={styles.activityNew}>Nieuw</span>}
                    </article>
                  ))}
                </div>
              )}
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

        {tab === "nieuwsbrief" && (
          <div className={styles.newsletterAdmin}>
            <div className={styles.newsletterGrid}>
              <form className={styles.newsletterComposer} onSubmit={handleNewsletterSend}>
                <div className={styles.newsletterHeading}>
                  <div>
                    <p className={styles.eyebrow}>Nieuwe nieuwsbrief</p>
                    <h2>Schrijf vanuit Cherelle.</h2>
                    <p>
                      De nieuwsbrief wordt persoonlijk per klant verstuurd en begint automatisch met de voornaam.
                    </p>
                  </div>
                  <span>{newsletterRecipients.length} geselecteerd</span>
                </div>

                <label>
                  <span>Onderwerp</span>
                  <input
                    value={newsletterSubject}
                    onChange={(event) => setNewsletterSubject(event.target.value)}
                    placeholder="Onderwerp van de nieuwsbrief"
                    required
                  />
                </label>

                <label>
                  <span>Bericht</span>
                  <textarea
                    rows={12}
                    value={newsletterBody}
                    onChange={(event) => setNewsletterBody(event.target.value)}
                    placeholder="Schrijf hier de nieuwsbrief..."
                    required
                  />
                </label>

                <div className={styles.newsletterSendBar}>
                  <p>
                    Voor verzending verschijnt nog één bevestiging met het aantal ontvangers.
                  </p>
                  <button
                    className={styles.primaryButton}
                    type="submit"
                    disabled={newsletterBusy || newsletterRecipients.length === 0}
                  >
                    {newsletterBusy ? "Versturen…" : "Nieuwsbrief versturen"}
                  </button>
                </div>
              </form>

              <aside className={styles.newsletterRecipients}>
                <div className={styles.newsletterRecipientsHead}>
                  <div>
                    <p className={styles.eyebrow}>Ontvangers</p>
                    <h3>Klantenbestand</h3>
                  </div>
                  <div>
                    <button type="button" onClick={selectAllNewsletterRecipients}>Alles</button>
                    <button type="button" onClick={() => setNewsletterRecipients([])}>Geen</button>
                  </div>
                </div>

                <div className={styles.newsletterClientList}>
                  {clients.length === 0 ? (
                    <div className={styles.emptyState}>Nog geen klanten beschikbaar.</div>
                  ) : (
                    clients.map((client) => (
                      <label key={client.id}>
                        <input
                          type="checkbox"
                          checked={newsletterRecipients.includes(client.id)}
                          onChange={() => toggleNewsletterRecipient(client.id)}
                        />
                        <span className={styles.newsletterClientAvatar}>
                          {client.name.trim().slice(0, 1).toUpperCase()}
                        </span>
                        <span>
                          <strong>{client.name}</strong>
                          <small>{client.email}</small>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </aside>
            </div>

            <section className={styles.newsletterHistory}>
              <div className={styles.newsletterHistoryHead}>
                <div>
                  <p className={styles.eyebrow}>Verzonden</p>
                  <h2>Nieuwsbriefhistorie</h2>
                </div>
              </div>

              {newsletters.length === 0 ? (
                <div className={styles.emptyState}>Nog geen nieuwsbrieven verstuurd.</div>
              ) : (
                <div className={styles.newsletterHistoryList}>
                  {newsletters.map((item) => (
                    <article key={item.id}>
                      <div>
                        <strong>{item.subject}</strong>
                        <span>{formatAdminDate(item.sent_at)}</span>
                      </div>
                      <p>{item.body}</p>
                      <small>{item.recipient_count} ontvanger{item.recipient_count === 1 ? "" : "s"}</small>
                    </article>
                  ))}
                </div>
              )}
            </section>
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

function AdminIntakeRow({
  label,
  value,
  detail,
  multiline = false,
}: {
  label: string;
  value: string;
  detail?: string | null;
  multiline?: boolean;
}) {
  return (
    <div className={styles.adminIntakeRow}>
      <span>{label}</span>
      <div>
        <strong className={multiline ? styles.adminIntakeMultiline : ""}>{value}</strong>
        {detail && <p>{detail}</p>}
      </div>
    </div>
  );
}

function MediaCard({
  slot,
  label,
  preview,
  initialAltNl,
  initialAltEn,
  busy,
  canDelete = false,
  onUpload,
  onDelete,
}: {
  slot: string;
  label: string;
  preview: string;
  initialAltNl: string;
  initialAltEn: string;
  busy: boolean;
  canDelete?: boolean;
  onUpload: (slot: string, file: File, altNl: string, altEn: string) => Promise<void>;
  onDelete?: (slot: string) => Promise<void>;
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
        <div className={styles.mediaActions}>
          <button
            className={styles.primaryButton}
            type="button"
            disabled={!file || busy}
            onClick={() => file && void onUpload(slot, file, altNl, altEn)}
          >
            {busy ? "Uploaden…" : "Foto vervangen"}
          </button>
          {canDelete && onDelete && (
            <button
              className={styles.dangerButton}
              type="button"
              disabled={busy}
              onClick={() => void onDelete(slot)}
            >
              Eigen foto verwijderen
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
