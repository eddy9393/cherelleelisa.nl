"use client";

import { useEffect, useMemo, useState } from "react";

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "select";
  options?: string[];
  required?: boolean;
  helper?: string;
};

type Step = {
  title: string;
  short: string;
  intro: string;
  tip: string;
  known?: string;
  fields: Field[];
};

type Answers = Record<string, string>;

const tokenKey = "cherelle-legal-questionnaire-token";
const cacheKey = "cherelle-legal-questionnaire-cache";

const STEPS: Step[] = [
  {
    short: "Bedrijfsgegevens",
    title: "Wat zijn de officiële bedrijfsgegevens?",
    intro: "Deze gegevens komen in de privacyverklaring en algemene voorwaarden. Neem ze exact over uit de officiële administratie.",
    tip: "Gebruik de handelsnaam, KvK-gegevens en contactgegevens zoals klanten die ook op facturen of officiële communicatie zien. Vul een btw-id alleen in als dat voor deze onderneming van toepassing is.",
    fields: [
      { key: "q1_trade_name", label: "Officiële handelsnaam", required: true },
      { key: "q1_owner_name", label: "Naam ondernemer", required: true },
      { key: "q1_address", label: "Vestigingsadres", required: true },
      { key: "q1_kvk", label: "KvK-nummer", required: true },
      { key: "q1_vat", label: "Btw-id", helper: "Laat leeg als dit niet van toepassing is." },
      { key: "q1_email", label: "Zakelijk e-mailadres", required: true, placeholder: "bijv. info@..." },
      { key: "q1_phone", label: "Zakelijk telefoonnummer", required: true },
    ],
  },
  {
    short: "Diensten",
    title: "Welke diensten bied je juridisch aan?",
    intro: "Noem alleen diensten die daadwerkelijk verkocht of geboekt kunnen worden. Dit bepaalt op welke overeenkomsten de voorwaarden van toepassing worden.",
    tip: "Op de website staan nu onder andere 1-op-1 sessies, The Feminine Way, retreats en ceremonies / Soul Unbound. Bevestig wat hiervan echt als betaalde dienst wordt aangeboden en voeg eventuele andere diensten toe.",
    fields: [
      {
        key: "q2_services",
        label: "Diensten die klanten kunnen afnemen",
        type: "textarea",
        required: true,
        placeholder: "Bijvoorbeeld:\n1-op-1 sessies\nThe Feminine Way\nRetreats\nCeremonies / Soul Unbound",
      },
      {
        key: "q2_business_customers",
        label: "Bied je deze diensten alleen aan consumenten aan, of ook aan zakelijke klanten?",
        type: "select",
        options: ["Alleen consumenten", "Consumenten en zakelijke klanten", "Alleen zakelijke klanten"],
        required: true,
      },
      {
        key: "q2_custom_notes",
        label: "Zijn er diensten waarvoor afwijkende regels moeten gelden?",
        type: "textarea",
        helper: "Bijvoorbeeld aparte regels voor retreats of meerdaagse trajecten.",
      },
    ],
  },
  {
    short: "Boeken & betalen",
    title: "Wanneer is een boeking definitief en hoe wordt er betaald?",
    intro: "Hier leggen we vast wanneer er een overeenkomst ontstaat en welke betalingsafspraken klanten vooraf moeten kennen.",
    tip: "Leg de betaaltermijn vooraf vast en gebruik die consequent op offerte, overeenkomst en factuur. Bij trajecten kun je apart vastleggen of betaling ineens of in termijnen mogelijk is.",
    fields: [
      { key: "q3_booking_final", label: "Wanneer is een boeking of traject definitief?", type: "textarea", required: true },
      {
        key: "q3_payment_moment",
        label: "Wanneer betaalt de klant?",
        type: "select",
        options: ["Volledig vooraf", "Achteraf", "Aanbetaling + restant", "Verschilt per dienst"],
        required: true,
      },
      { key: "q3_installments", label: "Zijn termijnbetalingen mogelijk? Zo ja, hoe?", type: "textarea", required: true },
      { key: "q3_payment_term", label: "Welke betaaltermijn geldt voor facturen?", required: true, placeholder: "Bijvoorbeeld: 14 dagen" },
      {
        key: "q3_vat",
        label: "Zijn de genoemde prijzen inclusief btw?",
        type: "select",
        options: ["Ja", "Nee", "Niet van toepassing / vrijgesteld"],
        required: true,
      },
      { key: "q3_late_payment", label: "Wat wil je doen bij te late betaling?", type: "textarea", required: true },
    ],
  },
  {
    short: "Annuleren",
    title: "Welke regels wil je voor annuleren, verplaatsen en no-show?",
    intro: "Deze afspraken moeten duidelijk zijn vóór iemand boekt, vooral bij gereserveerde tijd, trajecten en retreats.",
    tip: "Veel dienstverleners werken met een duidelijke kosteloze annuleringsgrens, bijvoorbeeld 24 of 48 uur. Kies alleen een termijn die bij jouw planning past. Bij online of telefonische verkoop aan consumenten kan daarnaast een wettelijke bedenktijd van 14 dagen spelen.",
    fields: [
      { key: "q4_free_cancel", label: "Tot wanneer mag iemand kosteloos annuleren?", required: true },
      { key: "q4_late_cancel", label: "Wat gebeurt er als iemand daarna annuleert?", type: "textarea", required: true },
      { key: "q4_reschedule", label: "Mag een afspraak worden verplaatst? Onder welke voorwaarden?", type: "textarea", required: true },
      { key: "q4_no_show", label: "Wat gebeurt er bij niet verschijnen (no-show)?", type: "textarea", required: true },
      { key: "q4_retreats", label: "Welke aparte annuleringsregels gelden voor retreats / ceremonies?", type: "textarea", required: true },
      {
        key: "q4_distance_sales",
        label: "Kunnen klanten op afstand definitief boeken (website, e-mail, telefoon of DM)?",
        type: "select",
        options: ["Ja", "Nee", "Soms"],
        required: true,
      },
      {
        key: "q4_start_within_14",
        label: "Kan een betaalde dienst al binnen 14 dagen na de boeking starten?",
        type: "select",
        options: ["Ja", "Nee", "Soms"],
        required: true,
      },
    ],
  },
  {
    short: "Veiligheid",
    title: "Hoe wil je verantwoordelijkheid, veiligheid en contra-indicaties vastleggen?",
    intro: "Omdat de website ook intake- en gezondheidsinformatie verwerkt, moet heel duidelijk zijn wat de begeleiding wel en niet is.",
    tip: "Beschrijf feitelijk of je coaching of begeleiding biedt en voorkom medische claims die je niet kunt waarmaken. Leg vast wanneer deelname niet verantwoord is en dat veiligheid altijd voorrang heeft.",
    fields: [
      {
        key: "q5_service_type",
        label: "Hoe omschrijf je jouw dienstverlening?",
        type: "select",
        options: ["Coaching / begeleiding", "Therapie", "Behandeling", "Anders"],
        required: true,
      },
      { key: "q5_medical_disclaimer", label: "Is de begeleiding een vervanging voor medische of psychologische behandeling?", type: "textarea", required: true },
      { key: "q5_contraindications", label: "Welke contra-indicaties gelden?", type: "textarea", required: true, helper: "Noem de situaties waarin deelname niet of alleen na overleg kan." },
      {
        key: "q5_refuse",
        label: "Mag Cherelle Elisa deelname weigeren of stoppen als deelname niet verantwoord voelt?",
        type: "select",
        options: ["Ja", "Nee", "Alleen in specifieke situaties"],
        required: true,
      },
      { key: "q5_stop_trajectory", label: "Wat gebeurt er financieel en praktisch als een traject tussentijds moet stoppen?", type: "textarea", required: true },
    ],
  },
  {
    short: "Persoonsgegevens",
    title: "Waarvoor gebruik je de persoonsgegevens die de website verwerkt?",
    intro: "De techniek laat al zien welke gegevens worden verzameld. Jij hoeft vooral te bevestigen waarom je die informatie nodig hebt en of er iets ontbreekt.",
    known: "Technisch bekend: contactformulier (naam, e-mail, telefoon, interesse, bericht), klantaccount (naam, e-mail, telefoon), intake met gezondheids- en welzijnsinformatie, persoonlijke berichten, nieuwsbriefgegevens en first-party bezoekersstatistieken. De eigen analytics bevat een willekeurige sessie-id, pad, optionele verwijzer en tijdstip; geen IP-adres of browserfingerprint.",
    tip: "Gezondheidsgegevens zijn bijzondere persoonsgegevens en verdienen extra zorg. Noteer per categorie alleen een doel dat echt nodig is. Voor de privacyverklaring moeten doel, grondslag en bewaartermijn later bij elkaar passen.",
    fields: [
      { key: "q6_contact_purpose", label: "Waarvoor gebruik je gegevens uit het contactformulier?", type: "textarea", required: true },
      { key: "q6_account_purpose", label: "Waarvoor gebruik je klantaccount- en berichtgegevens?", type: "textarea", required: true },
      { key: "q6_intake_purpose", label: "Waarom heb je de intake- en gezondheidsgegevens nodig?", type: "textarea", required: true },
      { key: "q6_payment_purpose", label: "Welke persoonsgegevens gebruik je voor facturatie / betalingen?", type: "textarea", required: true },
      { key: "q6_analytics_purpose", label: "Waarvoor gebruik je de bezoekersstatistieken?", type: "textarea", required: true },
      { key: "q6_corrections", label: "Klopt bovenstaande technische inventarisatie? Vul correcties of aanvullingen in.", type: "textarea", required: true, placeholder: "Bijvoorbeeld: Klopt, geen aanvullingen." },
    ],
  },
  {
    short: "Bewaartermijnen",
    title: "Hoe lang wil je persoonsgegevens bewaren?",
    intro: "Voor de meeste persoonsgegevens geeft de AVG geen vast aantal maanden of jaren. Het uitgangspunt is: niet langer bewaren dan nodig.",
    tip: "Voor delen van de fiscale basisadministratie geldt doorgaans een wettelijke bewaartermijn van 7 jaar. Voor contactaanvragen, accounts, intakes, berichten en analytics bepaal je een kortere termijn die past bij het doel.",
    fields: [
      { key: "q8_contact", label: "Contactaanvragen", required: true, placeholder: "Bijvoorbeeld: 12 maanden na laatste contact" },
      { key: "q8_accounts", label: "Klantaccounts na einde begeleiding", required: true },
      { key: "q8_intakes", label: "Intake- en gezondheidsgegevens na laatste sessie / traject", required: true },
      { key: "q8_messages", label: "Persoonlijke berichten met klanten", required: true },
      { key: "q8_newsletter", label: "Nieuwsbriefgegevens", required: true, placeholder: "Bijvoorbeeld: tot uitschrijving, daarna alleen noodzakelijke uitschrijfregistratie" },
      { key: "q8_analytics", label: "Bezoekersstatistieken", required: true },
      { key: "q8_financial", label: "Facturen en fiscale administratie", required: true, placeholder: "Gebruikelijk/wettelijk: 7 jaar voor basisadministratie" },
    ],
  },
  {
    short: "Klachten",
    title: "Hoe wil je omgaan met klachten en geschillen?",
    intro: "Hiermee bepalen we de laatste basisafspraken voor de algemene voorwaarden.",
    tip: "Een korte, duidelijke klachtenroute werkt meestal beter dan zware juridische taal. Leg vast waar iemand een klacht indient, binnen welke termijn je reageert en of je eerst samen naar een oplossing wilt zoeken.",
    fields: [
      { key: "q10_complaint_channel", label: "Waar kunnen klanten een klacht indienen?", required: true, placeholder: "Bijvoorbeeld: info@cherelleelisa.nl" },
      { key: "q10_response_time", label: "Binnen welke termijn wil je inhoudelijk reageren?", required: true },
      {
        key: "q10_mutual_solution",
        label: "Wil je vastleggen dat partijen eerst samen proberen een oplossing te vinden?",
        type: "select",
        options: ["Ja", "Nee"],
        required: true,
      },
      {
        key: "q10_law",
        label: "Welk recht wil je van toepassing verklaren?",
        type: "select",
        options: ["Nederlands recht", "Anders / nog te bepalen"],
        required: true,
      },
      { key: "q10_disputes", label: "Zijn er nog specifieke wensen voor geschillen of bemiddeling?", type: "textarea", required: true, placeholder: "Bijvoorbeeld: geen aanvullende wensen." },
    ],
  },
];

function complete(step: Step, answers: Answers) {
  return step.fields
    .filter((field) => field.required)
    .every((field) => (answers[field.key] ?? "").trim().length > 0);
}

function getOrCreateToken() {
  const stored = window.localStorage.getItem(tokenKey);
  if (stored) return stored;
  const token = window.crypto.randomUUID();
  window.localStorage.setItem(tokenKey, token);
  return token;
}

export default function LegalQuestionnairePage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [sessionToken, setSessionToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const token = getOrCreateToken();
    setSessionToken(token);

    let cached: { answers?: Answers; activeIndex?: number } = {};
    try {
      cached = JSON.parse(window.localStorage.getItem(cacheKey) || "{}");
    } catch {
      cached = {};
    }

    if (cached.answers) setAnswers(cached.answers);
    if (Number.isInteger(cached.activeIndex)) {
      setActiveIndex(Math.max(0, Math.min(STEPS.length - 1, cached.activeIndex ?? 0)));
    }

    let active = true;
    void fetch("/api/legal-questionnaire", {
      headers: { "x-questionnaire-token": token },
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result?.ok) throw new Error(result?.error || "Voortgang kon niet worden geladen.");
        if (!active || !result.exists || !result.questionnaire) return;

        setAnswers(result.questionnaire.answers ?? {});
        setActiveIndex(Math.max(0, Math.min(STEPS.length - 1, result.questionnaire.current_question ?? 0)));
        setSavedAt(result.questionnaire.updated_at ?? null);
        setFinished(Boolean(result.questionnaire.completed_at));
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Voortgang kon niet worden geladen.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!sessionToken) return;
    window.localStorage.setItem(cacheKey, JSON.stringify({ answers, activeIndex }));
  }, [answers, activeIndex, sessionToken]);

  const completed = useMemo(() => STEPS.filter((step) => complete(step, answers)).length, [answers]);
  const progress = Math.round((completed / STEPS.length) * 100);
  const step = STEPS[activeIndex];

  function updateAnswer(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setMessage("");
    setError("");
    setFinished(false);
  }

  async function save(nextIndex = activeIndex, quiet = false) {
    if (!sessionToken) return false;
    setSaving(true);
    setError("");
    if (!quiet) setMessage("");

    try {
      const response = await fetch("/api/legal-questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-questionnaire-token": sessionToken,
        },
        body: JSON.stringify({
          answers,
          current_question: nextIndex,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) throw new Error(result?.error || "Opslaan is mislukt.");

      setSavedAt(result.questionnaire?.updated_at ?? new Date().toISOString());
      setFinished(Boolean(result.completed));
      if (!quiet) setMessage("Opgeslagen.");
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Opslaan is mislukt.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function goTo(index: number) {
    if (index === activeIndex || saving) return;
    const ok = await save(index, true);
    if (ok) {
      setActiveIndex(index);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function previous() {
    const nextIndex = Math.max(0, activeIndex - 1);
    const ok = await save(nextIndex, true);
    if (ok) {
      setActiveIndex(nextIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function next() {
    const nextIndex = Math.min(STEPS.length - 1, activeIndex + 1);
    const ok = await save(nextIndex, false);
    if (ok && nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <main className="legalPublicPage">
      <header className="legalPublicHeader">
        <a href="/">CHERELLE ELISA</a>
        <span>Voorbereiding juridische documenten</span>
      </header>

      <section className="legalPublicHero">
        <p>Privacyverklaring & algemene voorwaarden</p>
        <h1>Beantwoord dit rustig stap voor stap.</h1>
        <div className="legalPublicProgress">
          <div>
            <strong>{progress}%</strong>
            <span>{completed} van {STEPS.length} onderdelen compleet</span>
          </div>
          <div className="legalPublicProgressTrack" aria-label={`${progress}% compleet`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <div className="legalPublicShell">
        <nav className="legalPublicSteps" aria-label="Onderdelen vragenlijst">
          {STEPS.map((item, index) => {
            const done = complete(item, answers);
            return (
              <button
                type="button"
                key={item.short}
                className={[
                  "legalPublicStep",
                  activeIndex === index ? "isActive" : "",
                  done ? "isDone" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => void goTo(index)}
                disabled={saving}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.short}</strong>
                <i aria-hidden="true">{done ? "✓" : "→"}</i>
              </button>
            );
          })}
        </nav>

        <section className="legalPublicCard">
          {loading ? (
            <div className="legalPublicLoading">Vragenlijst laden…</div>
          ) : (
            <>
              <div className="legalPublicCardHead">
                <p>Onderdeel {activeIndex + 1} van {STEPS.length}</p>
                <h2>{step.title}</h2>
                <div>{step.intro}</div>
              </div>

              {step.known && (
                <div className="legalPublicKnown">
                  <strong>Dit weten we al van de website</strong>
                  <p>{step.known}</p>
                </div>
              )}

              <div className="legalPublicTip">
                <span>Tip</span>
                <p>{step.tip}</p>
              </div>

              <div className="legalPublicFields">
                {step.fields.map((field) => (
                  <label key={field.key}>
                    <span className="legalPublicLabel">
                      <strong>{field.label}</strong>
                      {field.required ? <em>verplicht</em> : <em>optioneel</em>}
                    </span>

                    {field.type === "textarea" ? (
                      <textarea
                        rows={5}
                        value={answers[field.key] ?? ""}
                        onChange={(event) => updateAnswer(field.key, event.target.value)}
                        placeholder={field.placeholder}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={answers[field.key] ?? ""}
                        onChange={(event) => updateAnswer(field.key, event.target.value)}
                      >
                        <option value="">Kies een antwoord</option>
                        {field.options?.map((option) => (
                          <option value={option} key={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={answers[field.key] ?? ""}
                        onChange={(event) => updateAnswer(field.key, event.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}

                    {field.helper ? <small>{field.helper}</small> : null}
                  </label>
                ))}
              </div>

              {(message || error) && (
                <p className={error ? "legalPublicError" : "legalPublicSuccess"}>
                  {error || message}
                </p>
              )}

              {finished && (
                <div className="legalPublicFinished">
                  <span>✓</span>
                  <div>
                    <strong>Alles is compleet en opgeslagen.</strong>
                    <p>De antwoorden zijn klaar om te gebruiken voor de privacyverklaring en algemene voorwaarden.</p>
                  </div>
                </div>
              )}

              <div className="legalPublicActions">
                <button
                  type="button"
                  className="legalPublicSecondary"
                  onClick={() => void previous()}
                  disabled={saving || activeIndex === 0}
                >
                  ← Vorige
                </button>

                <div>
                  {savedAt && <small>Opgeslagen {new Date(savedAt).toLocaleString("nl-NL")}</small>}
                  <button
                    type="button"
                    className="legalPublicPrimary"
                    onClick={() => void next()}
                    disabled={saving}
                  >
                    {saving
                      ? "Opslaan…"
                      : activeIndex === STEPS.length - 1
                        ? "Antwoorden opslaan"
                        : "Opslaan en volgende →"}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
