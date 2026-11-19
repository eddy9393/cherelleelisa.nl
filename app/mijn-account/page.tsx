"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  accountIsAdmin,
  CherelleClient,
  CherelleIntake,
  clearAccountSession,
  CmsSession,
  getSavedAccountSession,
  loadOwnClientPortal,
  saveClientIntake,
  verifyAccountSession,
} from "../../lib/cherelleCms";

type PortalSection = "overzicht" | "intake" | "voorbereiding" | "contra";

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
  const [section, setSection] = useState<PortalSection>("overzicht");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submitted = Boolean(draft.submitted_at);

  const completion = useMemo(() => {
    const values = [
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
      draft.contraindications_acknowledged,
      draft.declaration_accepted,
      draft.signature_name,
    ];
    const complete = values.filter((value) => value !== null && value !== "" && value !== false).length;
    return Math.min(100, Math.round((complete / values.length) * 100));
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
        if (!active) return;
        setSession(saved);
        setClient(data.client);
        setDraft(data.intake ? { ...data.intake } : emptyIntake);
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

  function update<K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
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
        <p className="accountPortalScript">jouw plek</p>
        <h1>Welkom, {client.name.split(" ")[0]}.</h1>
        <p>
          Alles voor jouw sessie op één rustige plek. Je antwoorden zijn alleen zichtbaar voor jou en Cherelle.
        </p>
      </section>

      <div className="clientPortalWorkspace">
        <nav className="clientPortalNav" aria-label="Persoonlijke omgeving">
          {([
            ["overzicht", "Overzicht"],
            ["intake", "Intake"],
            ["voorbereiding", "Voorbereiding"],
            ["contra", "Contra-indicaties"],
          ] as Array<[PortalSection, string]>).map(([id, label], index) => (
            <button
              key={id}
              type="button"
              className={section === id ? "isActive" : ""}
              onClick={() => {
                setSection(id);
                setError("");
                setMessage("");
              }}
            >
              <span>0{index + 1}</span>
              {label}
            </button>
          ))}
        </nav>

        <section className="clientPortalPanel">
          {(message || error) && (
            <div className={error ? "clientPortalNotice isError" : "clientPortalNotice"}>
              {error || message}
            </div>
          )}

          {section === "overzicht" && (
            <div className="clientOverview">
              <div className="clientOverviewIntro">
                <p className="accountPortalKicker">Sound of soul</p>
                <h2>Lieve vrouw,</h2>
                <p>
                  Wat bijzonder dat je ‘ja’ hebt gezegd tegen jezelf. Door deze keuze open je de deur naar meer bewustzijn,
                  energie en diepe transformatie. Deze intake helpt om jouw sessie veilig en afgestemd te laten verlopen.
                  Neem de tijd en beantwoord de vragen eerlijk. Alles wat je deelt blijft volledig vertrouwelijk.
                </p>
                <p>Ik kijk ernaar uit om deze reis samen met jou te maken. ✨</p>
              </div>

              <div className="clientProgressCard">
                <div>
                  <span>Jouw intake</span>
                  <strong>{submitted ? "Verstuurd" : `${completion}%`}</strong>
                </div>
                <div className="clientProgressTrack">
                  <span style={{ width: submitted ? "100%" : `${completion}%` }} />
                </div>
                <p>
                  {submitted
                    ? `Verstuurd op ${formatDate(draft.submitted_at)}. Je kunt je antwoorden nog bekijken en waar nodig bijwerken.`
                    : "Je kunt tussentijds opslaan en later verdergaan."}
                </p>
                <button type="button" onClick={() => setSection("intake")}>
                  {submitted ? "Bekijk intake" : "Ga verder met intake"} →
                </button>
              </div>

              <div className="clientOverviewCards">
                <button type="button" onClick={() => setSection("intake")}>
                  <span>01</span>
                  <strong>Intake</strong>
                  <p>Persoonlijke gegevens, intentie, ervaring en gezondheid.</p>
                </button>
                <button type="button" onClick={() => setSection("voorbereiding")}>
                  <span>02</span>
                  <strong>Voorbereiding</strong>
                  <p>Kleding, eten en drinken, wat je meeneemt en de locatie.</p>
                </button>
                <button type="button" onClick={() => setSection("contra")}>
                  <span>03</span>
                  <strong>Contra-indicaties</strong>
                  <p>Lees deze informatie zorgvuldig door voor jouw sessie.</p>
                </button>
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
