"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  accountIsAdmin,
  acknowledgeClientLegal,
  CherelleClient,
  CherelleClientMessage,
  CherelleIntake,
  clearAccountSession,
  CmsSession,
  deleteOwnClientAccount,
  getSavedAccountSession,
  loadClientMessages,
  loadOwnClientPortal,
  markClientMessagesRead,
  saveClientIntake,
  setAccountPassword,
  updateAccountEmail,
  updateClientProfile,
  verifyAccountSession,
} from "../../lib/cherelleCms";

type PortalSection = "overzicht" | "berichten" | "intake" | "voorbereiding" | "contra" | "gegevens";

type IntakeDraft = Omit<CherelleIntake, "client_id" | "updated_at">;

const emptyIntake: IntakeDraft = {
  birth_date: null,
  phone: null,
  intention: null,
  energy_experience_level: null,
  intense_energy_experience: null,
  intense_energy_details: null,
  physical_conditions: null,
  physical_conditions_details: null,
  medications: null,
  medications_details: null,
  meditation_breathwork_experience: null,
  meditation_breathwork_details: null,
  mental_health_or_trauma: null,
  mental_health_or_trauma_details: null,
  stimulants: null,
  stimulants_details: null,
  contraindications_acknowledged: false,
  declaration_accepted: false,
  health_data_consent: false,
  health_data_consent_at: null,
  signature_name: null,
  signature_date: null,
  submitted_at: null,
};

const contraindications = [
  "Zwangerschap",
  "Ernstige PTSS of niet-verwerkt trauma",
  "Diabetes (alle typen)",
  "Ernstige astma",
  "Netvliesloslating",
  "Epilepsie of voorgeschiedenis van aanvallen",
  "Aneurysma (in hoofd of elders)",
  "Recente operaties, hechtingen of wonden",
  "Hoge bloeddruk (zonder medicatie)",
  "Glaucoom",
];

const medicationContraindications = [
  "Antidepressiva of antipsychotica",
  "Angstremmers",
  "Medicatie bij ADHD, ADD of OCD",
  "Middelen die de hersenstructuur beïnvloeden",
];

const psychiatricContraindications = [
  "Bipolaire stoornis",
  "Schizofrenie",
  "Zware depressie",
  "Zware psychosomatische klachten",
  "Crisis of opname in de afgelopen 10 jaar",
];

const substanceContraindications = [
  "Drugs of recreatieve middelen",
  "Grote hoeveelheden cafeïne",
  "Alcohol (kort voor of op de dag zelf)",
];

function yesNoValue(value: boolean | null) {
  return value === null ? "" : value ? "yes" : "no";
}

function parseYesNo(value: string): boolean | null {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function ClientAccountPage() {
  const [session, setSession] = useState<CmsSession | null>(null);
  const [client, setClient] = useState<CherelleClient | null>(null);
  const [draft, setDraft] = useState<IntakeDraft>(emptyIntake);
  const [messages, setMessages] = useState<CherelleClientMessage[]>([]);
  const [section, setSection] = useState<PortalSection>("overzicht");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accountBusy, setAccountBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [legalCheck, setLegalCheck] = useState(false);

  const submitted = Boolean(draft.submitted_at);
  const legalAcknowledged = Boolean(
    client?.privacy_acknowledged_at && client?.terms_acknowledged_at
  );

  const completion = useMemo(() => {
    const answered = [
      draft.birth_date,
      draft.phone,
      draft.intention,
      draft.energy_experience_level,
      draft.intense_energy_experience,
      draft.physical_conditions,
      draft.medications,
      draft.meditation_breathwork_experience,
      draft.mental_health_or_trauma,
      draft.stimulants,
    ].filter((value) => value !== null && value !== "").length;

    const confirmations =
      Number(draft.contraindications_acknowledged) +
      Number(draft.declaration_accepted) +
      Number(draft.health_data_consent) +
      Number(Boolean(draft.signature_name?.trim()));

    return Math.min(100, Math.round(((answered + confirmations) / 14) * 100));
  }, [draft]);

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

      try {
        const data = await loadOwnClientPortal(saved);
        const messageRows = await loadClientMessages(saved, data.client.id);
        if (!active) return;
        setSession(saved);
        setClient(data.client);
        setMessages(messageRows);
        setProfileName(data.client.name);
        setProfilePhone(data.intake?.phone ?? "");
        setProfileEmail(data.client.email);
        setDraft(
          data.intake
            ? {
                ...data.intake,
                signature_date: data.intake.signature_date ?? new Date().toISOString().slice(0, 10),
              }
            : {
                ...emptyIntake,
                signature_date: new Date().toISOString().slice(0, 10),
              }
        );
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Jouw persoonlijke omgeving kon niet worden geladen."
        );
      } finally {
        if (active) setReady(true);
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

  async function openPortalSection(next: PortalSection) {
    if (!legalAcknowledged && next !== "overzicht") {
      setSection("overzicht");
      setMessage("");
      setError("Bevestig eerst dat je de privacyverklaring en algemene voorwaarden hebt gelezen.");
      return;
    }

    setSection(next);
    setError("");
    setMessage("");

    if (next === "berichten" && session && client && messages.some((item) => !item.read_at)) {
      try {
        await markClientMessagesRead(session, client.id);
        const now = new Date().toISOString();
        setMessages((current) => current.map((item) => ({ ...item, read_at: item.read_at || now })));
      } catch {
        // The messages remain readable even when the read marker cannot be stored.
      }
    }
  }

  async function handleLegalAcknowledgement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !client || !legalCheck) {
      setError("Vink eerst aan dat je beide verklaringen hebt gelezen.");
      return;
    }

    setAccountBusy(true);
    setError("");
    setMessage("");

    try {
      const updatedClient = await acknowledgeClientLegal(session, client.id);
      setClient(updatedClient);
      setLegalCheck(false);
      setMessage("Dankjewel. Je bevestiging is opgeslagen.");
    } catch (ackError) {
      setError(
        ackError instanceof Error
          ? ackError.message
          : "Je bevestiging kon niet worden opgeslagen."
      );
    } finally {
      setAccountBusy(false);
    }
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !client) return;

    const name = profileName.trim();
    const email = profileEmail.trim().toLowerCase();
    if (!name || !email) {
      setError("Naam en e-mailadres zijn verplicht.");
      return;
    }

    setAccountBusy(true);
    setError("");
    setMessage("");

    try {
      let nextSession = session;
      await updateClientProfile(session, client.id, name, profilePhone);

      if (email !== client.email.toLowerCase()) {
        nextSession = await updateAccountEmail(session, email);
        setSession(nextSession);
      }

      const fresh = await loadOwnClientPortal(nextSession);
      setClient(fresh.client);
      setDraft(
        fresh.intake
          ? {
              ...fresh.intake,
              signature_date: fresh.intake.signature_date ?? new Date().toISOString().slice(0, 10),
            }
          : { ...emptyIntake, signature_date: new Date().toISOString().slice(0, 10) }
      );
      setProfileName(fresh.client.name);
      setProfilePhone(fresh.intake?.phone ?? profilePhone);
      setProfileEmail(fresh.client.email);
      setMessage(
        email !== client.email.toLowerCase()
          ? "Je gegevens zijn opgeslagen. Voor een nieuw e-mailadres kan nog een bevestigingsmail nodig zijn."
          : "Je gegevens zijn opgeslagen."
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Je gegevens konden niet worden opgeslagen.");
    } finally {
      setAccountBusy(false);
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    if (newPassword.length < 8) {
      setError("Gebruik minimaal 8 tekens voor je nieuwe wachtwoord.");
      return;
    }
    if (newPassword !== newPasswordAgain) {
      setError("De wachtwoorden zijn niet hetzelfde.");
      return;
    }

    setAccountBusy(true);
    setError("");
    setMessage("");

    try {
      await setAccountPassword(session, newPassword);
      setNewPassword("");
      setNewPasswordAgain("");
      setMessage("Je wachtwoord is aangepast.");
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : "Je wachtwoord kon niet worden aangepast.");
    } finally {
      setAccountBusy(false);
    }
  }

  async function handleAccountDelete() {
    if (!session || deleteConfirm !== "VERWIJDEREN") {
      setError("Typ VERWIJDEREN om het account definitief te verwijderen.");
      return;
    }

    setAccountBusy(true);
    setError("");
    setMessage("");

    try {
      await deleteOwnClientAccount(session);
      clearAccountSession();
      window.location.replace("/");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Je account kon niet worden verwijderd.");
      setAccountBusy(false);
    }
  }

  function update<K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (message) setMessage("");
  }

  function updateHealthConsent(checked: boolean) {
    setDraft((current) => ({
      ...current,
      health_data_consent: checked,
      health_data_consent_at:
        checked && !current.health_data_consent_at
          ? new Date().toISOString()
          : current.health_data_consent_at,
    }));
    if (message) setMessage("");
  }

  async function persistIntake(submit: boolean) {
    if (!session || !client) return;

    if (submit) {
      if (!draft.contraindications_acknowledged) {
        setError("Bevestig eerst dat je de contra-indicaties zorgvuldig hebt doorgenomen.");
        setSection("contra");
        return;
      }
      if (!draft.health_data_consent) {
        setError("Geef eerst expliciet toestemming voor het verwerken van de gezondheidsgegevens uit je intake.");
        setSection("intake");
        return;
      }
      if (!draft.declaration_accepted || !draft.signature_name?.trim() || !draft.signature_date) {
        setError("Bevestig de verklaring en vul je digitale handtekening en datum in.");
        setSection("intake");
        return;
      }
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const saved = await saveClientIntake(session, client.id, {
        ...draft,
        signature_name: draft.signature_name?.trim() || null,
        submitted_at: submit ? new Date().toISOString() : draft.submitted_at,
      });
      setDraft({ ...saved });
      setMessage(submit ? "Je intake is veilig verstuurd naar Cherelle." : "Je antwoorden zijn opgeslagen.");
      if (submit) setSection("overzicht");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Je antwoorden konden niet worden opgeslagen."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void persistIntake(true);
  }

  if (!ready) {
    return (
      <main className="clientPortalPage">
        <div className="accountPortalLoading">Persoonlijke omgeving laden…</div>
      </main>
    );
  }

  if (!session || !client) {
    return (
      <main className="clientPortalPage">
        <div className="clientPortalLoadError">
          <p className="accountPortalScript">Cherelle Elisa</p>
          <h1>Jouw omgeving kon niet worden geopend.</h1>
          <p>{error || "Probeer opnieuw in te loggen."}</p>
          <a href="/account">Terug naar inloggen →</a>
        </div>
      </main>
    );
  }

  return (
    <main className="clientPortalPage">
      <header className="clientPortalHeader">
        <a href="/">CHERELLE ELISA</a>
        <div>
          <span>{client.name}</span>
          <button type="button" onClick={logout}>Uitloggen</button>
        </div>
      </header>

      <section className="clientPortalHero">
        <div className="clientPortalHeroInner">
          <div className="clientPortalHeroCopy">
            <p className="accountPortalScript">jouw plek</p>
            <p className="clientPortalEyebrow">Persoonlijke omgeving</p>
            <h1>Welkom, {client.name.split(" ")[0]}.</h1>
            <p>
              Alles voor jouw sessie op één rustige plek. Je antwoorden zijn alleen zichtbaar voor jou en Cherelle.
            </p>
          </div>

          <div className="clientHeroStatus">
            <div className="clientHeroStatusHead">
              <span>Jouw intake</span>
              <strong>{submitted ? "Verstuurd" : `${completion}%`}</strong>
            </div>
            <div className="clientHeroProgress" aria-hidden="true">
              <span style={{ width: submitted ? "100%" : `${completion}%` }} />
            </div>
            <p>
              {submitted
                ? `Verstuurd op ${formatDate(draft.submitted_at)}.`
                : "Je kunt tussentijds opslaan en later rustig verdergaan."}
            </p>
            <button type="button" onClick={() => void openPortalSection("intake")}>
              {submitted ? "Bekijk intake" : "Ga verder met intake"} →
            </button>
          </div>
        </div>
      </section>

      <div className="clientPortalWorkspace">
        <nav className="clientPortalNav" aria-label="Persoonlijke omgeving">
          {([
            ["overzicht", "Overzicht"],
            ["berichten", "Berichten"],
            ["intake", "Intake"],
            ["voorbereiding", "Voorbereiding"],
            ["contra", "Contra-indicaties"],
            ["gegevens", "Mijn gegevens"],
          ] as Array<[PortalSection, string]>).map(([id, label], index) => {
            const unread = id === "berichten" ? messages.filter((item) => !item.read_at).length : 0;
            return (
              <button
                key={id}
                type="button"
                className={section === id ? "isActive" : ""}
                onClick={() => void openPortalSection(id)}
              >
                <span>0{index + 1}</span>
                <span>{label}</span>
                {unread > 0 && <strong className="clientNavBadge">{unread}</strong>}
              </button>
            );
          })}
        </nav>

        <section className="clientPortalPanel">
          {(message || error) && (
            <div className={error ? "clientPortalNotice isError" : "clientPortalNotice"}>
              {error || message}
            </div>
          )}

          {section === "overzicht" && (
            <div className="clientOverview">
              {!legalAcknowledged && (
                <form className="clientLegalAcknowledgement" onSubmit={handleLegalAcknowledgement}>
                  <div>
                    <span>Eenmalige bevestiging</span>
                    <h3>Voordat je verdergaat.</h3>
                    <p>
                      Lees de documenten rustig door. Daarna kun je jouw persoonlijke omgeving en intake gebruiken.
                    </p>
                  </div>
                  <label className="legalConsentCheck">
                    <input
                      type="checkbox"
                      checked={legalCheck}
                      onChange={(event) => setLegalCheck(event.target.checked)}
                      required
                    />
                    <span>
                      Ik heb kennisgenomen van de{" "}
                      <a href="/privacyverklaring" target="_blank" rel="noreferrer">privacyverklaring</a>
                      {" "}en de{" "}
                      <a href="/algemene-voorwaarden" target="_blank" rel="noreferrer">algemene voorwaarden</a>.
                    </span>
                  </label>
                  <button type="submit" disabled={accountBusy || !legalCheck}>
                    {accountBusy ? "Opslaan…" : "Bevestigen en doorgaan"}
                  </button>
                </form>
              )}

              <div className="clientOverviewIntro">
                <p className="accountPortalKicker">Sound of soul</p>
                <h2>Lieve {client.name.trim().split(" ")[0]},</h2>
                <p>
                  Wat bijzonder dat je ‘ja’ hebt gezegd tegen jezelf. Door deze keuze open je de deur naar meer bewustzijn,
                  energie en diepe transformatie. Deze intake helpt om jouw sessie veilig en afgestemd te laten verlopen.
                  Neem de tijd en beantwoord de vragen eerlijk. Alles wat je deelt blijft volledig vertrouwelijk.
                </p>
                <p>Ik kijk ernaar uit om deze reis samen met jou te maken. ✨</p>
              </div>

              {messages[0] && (
                <button className="clientLatestMessage" type="button" onClick={() => void openPortalSection("berichten")}>
                  <span>Bericht van Cherelle</span>
                  <strong>{messages[0].subject}</strong>
                  <p>{messages[0].body}</p>
                  <small>Bekijk bericht →</small>
                </button>
              )}

              <div className="clientOverviewCards">
                <button type="button" onClick={() => void openPortalSection("intake")}>
                  <span>01</span>
                  <strong>Intake</strong>
                  <p>Persoonlijke gegevens, intentie, ervaring en gezondheid.</p>
                </button>
                <button type="button" onClick={() => void openPortalSection("voorbereiding")}>
                  <span>02</span>
                  <strong>Voorbereiding</strong>
                  <p>Kleding, eten en drinken, wat je meeneemt en de locatie.</p>
                </button>
                <button type="button" onClick={() => void openPortalSection("contra")}>
                  <span>03</span>
                  <strong>Contra-indicaties</strong>
                  <p>Lees deze informatie zorgvuldig door voor jouw sessie.</p>
                </button>
              </div>
            </div>
          )}

          {section === "berichten" && (
            <div className="clientMessagesPage">
              <header className="clientSectionHeading">
                <p className="accountPortalKicker">Berichten</p>
                <h2>Een bericht van Cherelle.</h2>
                <p>Persoonlijke berichten die Cherelle voor jou klaarzet, blijven hier terug te lezen.</p>
              </header>

              <div className="clientMessageList">
                {messages.length === 0 ? (
                  <div className="clientMessageEmpty">
                    <h3>Nog geen berichten.</h3>
                    <p>Wanneer Cherelle iets persoonlijk met je deelt, verschijnt het hier.</p>
                  </div>
                ) : (
                  messages.map((item) => (
                    <article key={item.id} className={!item.read_at ? "isUnread" : ""}>
                      <div className="clientMessageMeta">
                        <span>{formatDate(item.created_at)}</span>
                        {!item.read_at && <strong>Nieuw</strong>}
                      </div>
                      <h3>{item.subject}</h3>
                      <p>{item.body}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}

          {section === "intake" && (
            <form className="clientIntakeForm" onSubmit={handleSubmit}>
              <header className="clientSectionHeading">
                <p className="accountPortalKicker">Intake</p>
                <h2>Neem de tijd voor jezelf.</h2>
                <p>Je kunt tussentijds opslaan. Verstuur de intake pas wanneer alles voor jou klopt.</p>
              </header>

              <fieldset>
                <legend>Persoonlijke gegevens</legend>
                <div className="clientFormGrid">
                  <label>
                    <span>Naam</span>
                    <input value={client.name} readOnly />
                  </label>
                  <label>
                    <span>E-mailadres</span>
                    <input value={client.email} readOnly />
                  </label>
                  <label>
                    <span>Geboortedatum</span>
                    <input
                      type="date"
                      value={draft.birth_date ?? ""}
                      onChange={(event) => update("birth_date", event.target.value || null)}
                    />
                  </label>
                  <label>
                    <span>Telefoonnummer</span>
                    <input
                      type="tel"
                      value={draft.phone ?? ""}
                      onChange={(event) => update("phone", event.target.value || null)}
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Intentie & ervaring</legend>
                <label className="clientFullField">
                  <span>Wat is jouw intentie voor deze sessie?</span>
                  <textarea
                    rows={5}
                    value={draft.intention ?? ""}
                    onChange={(event) => update("intention", event.target.value || null)}
                  />
                </label>

                <div className="clientQuestion">
                  <span>Wat is je ervaring met Kundalini of ander energiewerk?</span>
                  <div className="clientRadioRow">
                    {[
                      ["none", "Geen ervaring"],
                      ["basic", "Basiservaring"],
                      ["advanced", "Gevorderd"],
                    ].map(([value, label]) => (
                      <label key={value}>
                        <input
                          type="radio"
                          name="energyExperience"
                          checked={draft.energy_experience_level === value}
                          onChange={() => update("energy_experience_level", value as "none" | "basic" | "advanced")}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <YesNoQuestion
                  label="Heb je ooit intense energetische ervaringen gehad?"
                  value={draft.intense_energy_experience}
                  details={draft.intense_energy_details}
                  onValue={(value) => update("intense_energy_experience", value)}
                  onDetails={(value) => update("intense_energy_details", value || null)}
                />
              </fieldset>

              <fieldset>
                <legend>Gezondheid & medische achtergrond</legend>
                <YesNoQuestion
                  label="Heb je fysieke klachten of medische aandoeningen?"
                  value={draft.physical_conditions}
                  details={draft.physical_conditions_details}
                  onValue={(value) => update("physical_conditions", value)}
                  onDetails={(value) => update("physical_conditions_details", value || null)}
                />
                <YesNoQuestion
                  label="Gebruik je medicijnen of supplementen?"
                  value={draft.medications}
                  details={draft.medications_details}
                  onValue={(value) => update("medications", value)}
                  onDetails={(value) => update("medications_details", value || null)}
                />
                <YesNoQuestion
                  label="Ervaring met meditatie, yoga of ademwerk?"
                  value={draft.meditation_breathwork_experience}
                  details={draft.meditation_breathwork_details}
                  onValue={(value) => update("meditation_breathwork_experience", value)}
                  onDetails={(value) => update("meditation_breathwork_details", value || null)}
                />
                <YesNoQuestion
                  label="Psychische klachten of verleden met trauma?"
                  value={draft.mental_health_or_trauma}
                  details={draft.mental_health_or_trauma_details}
                  onValue={(value) => update("mental_health_or_trauma", value)}
                  onDetails={(value) => update("mental_health_or_trauma_details", value || null)}
                />
                <YesNoQuestion
                  label="Gebruik van stimulerende middelen (alcohol, drugs, cafeïne)?"
                  value={draft.stimulants}
                  details={draft.stimulants_details}
                  onValue={(value) => update("stimulants", value)}
                  onDetails={(value) => update("stimulants_details", value || null)}
                />
              </fieldset>

              <fieldset>
                <legend>Verklaring & ondertekening</legend>
                <div className="clientDeclaration">
                  <label>
                    <input
                      type="checkbox"
                      checked={draft.health_data_consent}
                      onChange={(event) => updateHealthConsent(event.target.checked)}
                    />
                    <span>
                      Ik geef uitdrukkelijk toestemming om de gezondheids- en welzijnsgegevens die ik in deze intake
                      invul te verwerken voor de voorbereiding, veiligheid en afstemming van mijn begeleiding. Ik heb
                      hierover de <a href="/privacyverklaring" target="_blank" rel="noreferrer">privacyverklaring</a> gelezen.
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={draft.declaration_accepted}
                      onChange={(event) => update("declaration_accepted", event.target.checked)}
                    />
                    <span>
                      Ik bevestig dat ik alle vragen naar waarheid heb ingevuld. Ik begrijp dat een Kundalini-sessie
                      diepe energetische processen kan activeren en ik neem zelf verantwoordelijkheid voor mijn welzijn.
                    </span>
                  </label>
                </div>

                <div className="clientFormGrid">
                  <label>
                    <span>Digitale handtekening — typ je volledige naam</span>
                    <input
                      value={draft.signature_name ?? ""}
                      onChange={(event) => update("signature_name", event.target.value || null)}
                    />
                  </label>
                  <label>
                    <span>Datum</span>
                    <input
                      type="date"
                      value={draft.signature_date ?? ""}
                      onChange={(event) => update("signature_date", event.target.value || null)}
                    />
                  </label>
                </div>
              </fieldset>

              <div className="clientFormActions">
                <button type="button" className="isSecondary" disabled={saving} onClick={() => void persistIntake(false)}>
                  {saving ? "Opslaan…" : "Tussentijds opslaan"}
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? "Versturen…" : submitted ? "Wijzigingen opslaan" : "Intake versturen"}
                </button>
              </div>
            </form>
          )}

          {section === "voorbereiding" && (
            <div className="clientInfoPage">
              <header className="clientSectionHeading">
                <p className="accountPortalKicker">Voorbereiding</p>
                <h2>Een zachte voorbereiding op jouw sessie.</h2>
              </header>

              <div className="clientInfoGrid">
                <article>
                  <span>01</span>
                  <h3>Kleding</h3>
                  <p>
                    Draag comfortabele kleding waarin jij je goed voelt. Werk met laagjes – tijdens de sessie kun je het
                    warm of koud krijgen. Denk aan een vestje en warme sokken.
                  </p>
                </article>
                <article>
                  <span>02</span>
                  <h3>Eten & drinken</h3>
                  <p>
                    Eet licht en puur (bij voorkeur plantaardig) op de dag van de sessie. Vermijd koffie, alcohol en
                    dierlijke producten. Zo houd je jouw energie zuiver.
                  </p>
                </article>
                <article>
                  <span>03</span>
                  <h3>Wat neem je mee?</h3>
                  <p>Je hoeft niets mee te nemen, enkel eventueel je journal.</p>
                </article>
                <article>
                  <span>04</span>
                  <h3>Locatie sessie</h3>
                  <p>Lekstroom 57, Zoetermeer</p>
                </article>
              </div>

              <button className="clientNextButton" type="button" onClick={() => setSection("contra")}>
                Lees nu de contra-indicaties →
              </button>
            </div>
          )}

          {section === "contra" && (
            <div className="clientContraPage">
              <header className="clientSectionHeading">
                <p className="accountPortalKicker">Contra-indicaties</p>
                <h2>Voor Kundalini Ademwerk.</h2>
                <p>
                  Om jouw veiligheid te waarborgen, wil ik je vragen onderstaande contra-indicaties zorgvuldig door te nemen.
                  Bij twijfel: neem contact op. Jouw welzijn staat voorop.
                </p>
              </header>

              <div className="clientContraColumns">
                <ContraGroup title="Contra-indicaties" items={contraindications} />
                <ContraGroup title="Gebruik van medicatie zoals" items={medicationContraindications} />
                <ContraGroup title="Bij psychiatrische aandoeningen zoals" items={psychiatricContraindications} />
                <ContraGroup title="Actief gebruik van" items={substanceContraindications} />
              </div>

              <div className="clientImportant">
                <strong>Belangrijk</strong>
                <p>
                  Indien je twijfelt of iets van bovenstaande op jou van toepassing is, bespreek dit met ons. Samen kunnen
                  we kijken of en hoe deelname mogelijk is op een veilige manier. Je bent welkom maar jouw veiligheid komt
                  altijd op de eerste plaats.
                </p>
              </div>

              <label className="clientContraConfirm">
                <input
                  type="checkbox"
                  checked={draft.contraindications_acknowledged}
                  onChange={(event) => update("contraindications_acknowledged", event.target.checked)}
                />
                <span>Ik heb de contra-indicaties zorgvuldig doorgenomen.</span>
              </label>

              <div className="clientFormActions">
                <button
                  type="button"
                  className="isSecondary"
                  disabled={saving}
                  onClick={() => void persistIntake(false)}
                >
                  {saving ? "Opslaan…" : "Bevestiging opslaan"}
                </button>
                <button type="button" onClick={() => setSection("intake")}>
                  Naar verklaring & ondertekening →
                </button>
              </div>
            </div>
          )}
          {section === "gegevens" && (
            <div className="clientSettingsPage">
              <header className="clientSectionHeading">
                <p className="accountPortalKicker">Mijn gegevens</p>
                <h2>Jouw account en gegevens.</h2>
                <p>Pas je contactgegevens of wachtwoord aan, of verwijder je account definitief.</p>
              </header>

              <div className="clientSettingsGrid">
                <form className="clientSettingsCard" onSubmit={handleProfileSave}>
                  <div>
                    <span>01</span>
                    <h3>Persoonlijke gegevens</h3>
                  </div>
                  <label>
                    <span>Naam</span>
                    <input value={profileName} onChange={(event) => setProfileName(event.target.value)} required />
                  </label>
                  <label>
                    <span>Telefoonnummer</span>
                    <input type="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} />
                  </label>
                  <label>
                    <span>E-mailadres</span>
                    <input type="email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} required />
                  </label>
                  <button type="submit" disabled={accountBusy}>
                    {accountBusy ? "Opslaan…" : "Gegevens opslaan"}
                  </button>
                </form>

                <form className="clientSettingsCard" onSubmit={handlePasswordChange}>
                  <div>
                    <span>02</span>
                    <h3>Wachtwoord</h3>
                  </div>
                  <label>
                    <span>Nieuw wachtwoord</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      minLength={8}
                      required
                    />
                  </label>
                  <label>
                    <span>Herhaal wachtwoord</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPasswordAgain}
                      onChange={(event) => setNewPasswordAgain(event.target.value)}
                      minLength={8}
                      required
                    />
                  </label>
                  <button type="submit" disabled={accountBusy}>
                    {accountBusy ? "Aanpassen…" : "Wachtwoord aanpassen"}
                  </button>
                </form>

                <section className="clientSettingsCard clientDangerCard">
                  <div>
                    <span>03</span>
                    <h3>Account verwijderen</h3>
                  </div>
                  <p>
                    Hiermee worden je account, intake en persoonlijke berichten definitief verwijderd. Dit kan niet ongedaan worden gemaakt.
                  </p>
                  <label>
                    <span>Typ VERWIJDEREN ter bevestiging</span>
                    <input value={deleteConfirm} onChange={(event) => setDeleteConfirm(event.target.value)} />
                  </label>
                  <button
                    type="button"
                    disabled={accountBusy || deleteConfirm !== "VERWIJDEREN"}
                    onClick={() => void handleAccountDelete()}
                  >
                    Account definitief verwijderen
                  </button>
                </section>
              </div>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}

function YesNoQuestion({
  label,
  value,
  details,
  onValue,
  onDetails,
}: {
  label: string;
  value: boolean | null;
  details: string | null;
  onValue: (value: boolean | null) => void;
  onDetails: (value: string) => void;
}) {
  return (
    <div className="clientQuestion">
      <span>{label}</span>
      <div className="clientQuestionAnswer">
        <select value={yesNoValue(value)} onChange={(event) => onValue(parseYesNo(event.target.value))}>
          <option value="">Kies een antwoord</option>
          <option value="no">Nee</option>
          <option value="yes">Ja</option>
        </select>
        {value === true && (
          <input
            value={details ?? ""}
            onChange={(event) => onDetails(event.target.value)}
            placeholder="Namelijk…"
          />
        )}
      </div>
    </div>
  );
}

function ContraGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
