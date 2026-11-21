"use client";

import { useEffect, useMemo, useState } from "react";
import type { CmsSession } from "../../lib/cherelleCms";
import {
  LegalAnswers,
  loadLegalQuestionnaire,
  saveLegalQuestionnaire,
} from "../../lib/cherelleLegal";
import styles from "./admin.module.css";

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
  id: number;
  short: string;
  title: string;
  intro: string;
  tip: string;
  fields: Field[];
  locked?: boolean;
  known?: string;
};

const STEPS: Step[] = [
  {
    id: 1,
    short: "Bedrijfsgegevens",
    title: "Wat zijn de officiële bedrijfsgegevens?",
    intro: "Deze gegevens komen in de privacyverklaring en algemene voorwaarden. Neem ze exact over uit de officiële administratie.",
    tip: "Tip: gebruik de handelsnaam, KvK-gegevens en contactgegevens zoals klanten die ook op facturen of officiële communicatie zien. Vul een btw-id alleen in als die voor deze onderneming van toepassing is.",
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
    id: 2,
    short: "Diensten",
    title: "Welke diensten biedt Cherelle Elisa juridisch aan?",
    intro: "Noem alleen diensten die daadwerkelijk verkocht of geboekt kunnen worden. Dit bepaalt op welke overeenkomsten de voorwaarden van toepassing worden.",
    tip: "Tip: op de website staan nu onder andere 1-op-1 sessies, The Feminine Way, retreats en ceremonies / Soul Unbound. Bevestig wat hiervan echt als betaalde dienst wordt aangeboden en voeg eventuele andere diensten toe.",
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
    id: 3,
    short: "Boeken & betalen",
    title: "Wanneer is een boeking definitief en hoe wordt er betaald?",
    intro: "Hier leggen we vast wanneer er een overeenkomst ontstaat en welke betalingsafspraken klanten vooraf moeten kennen.",
    tip: "Tip: leg de betaaltermijn vooraf vast en gebruik die consequent op offerte, overeenkomst en factuur. Bij trajecten kun je apart vastleggen of betaling ineens of in termijnen mogelijk is.",
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
    id: 4,
    short: "Annuleren",
    title: "Welke regels wil je voor annuleren, verplaatsen en no-show?",
    intro: "Deze afspraken moeten duidelijk zijn vóór iemand boekt, vooral bij gereserveerde tijd, trajecten en retreats.",
    tip: "Tip: veel dienstverleners werken met een duidelijke kosteloze annuleringsgrens, bijvoorbeeld 24 of 48 uur. Kies alleen een termijn die bij jouw planning past. Bij online of telefonische verkoop aan consumenten kan daarnaast een wettelijke bedenktijd van 14 dagen spelen; als een dienst binnen die periode start, moeten we dat later specifiek verwerken.",
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
    id: 5,
    short: "Veiligheid",
    title: "Hoe wil je verantwoordelijkheid, veiligheid en contra-indicaties vastleggen?",
    intro: "Omdat de website ook intake- en gezondheidsinformatie verwerkt, moet heel duidelijk zijn wat de begeleiding wel en niet is.",
    tip: "Tip: beschrijf feitelijk of je coaching/begeleiding biedt en voorkom medische claims die je niet kunt waarmaken. Leg vast wanneer deelname niet verantwoord is en dat veiligheid altijd voorrang heeft.",
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
    id: 6,
    short: "Persoonsgegevens",
    title: "Waarvoor gebruikt Cherelle Elisa de persoonsgegevens die de website verwerkt?",
    intro: "De techniek laat al zien welke gegevens worden verzameld. Cherelle Elisa hoeft vooral te bevestigen waarom zij die informatie nodig heeft en of er iets ontbreekt.",
    known: "Technisch bekend: contactformulier (naam, e-mail, telefoon, interesse, bericht), klantaccount (naam, e-mail, telefoon), intake met gezondheids- en welzijnsinformatie, persoonlijke berichten, nieuwsbriefgegevens en first-party bezoekersstatistieken. De eigen analytics bevat een willekeurige sessie-id, pad, optionele verwijzer en tijdstip; geen IP-adres of browserfingerprint.",
    tip: "Tip: gezondheidsgegevens zijn bijzondere persoonsgegevens en verdienen extra zorg. Noteer per categorie alleen een doel dat echt nodig is. Voor de privacyverklaring moeten doel, grondslag en bewaartermijn later bij elkaar passen.",
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
    id: 7,
    short: "Techniek",
    title: "Welke externe techniek verwerkt gegevens?",
    intro: "Dit antwoord is al ingevuld op basis van de techniek die daadwerkelijk voor de website is gekoppeld.",
    tip: "Dit onderdeel is technisch vastgesteld. Als er later een betaalprovider, agenda-app of andere externe dienst bijkomt, moet deze lijst opnieuw worden bijgewerkt.",
    locked: true,
    fields: [
      { key: "q7_technology", label: "Bekende systemen", type: "textarea", required: true },
    ],
  },
  {
    id: 8,
    short: "Bewaartermijnen",
    title: "Hoe lang wil je persoonsgegevens bewaren?",
    intro: "Voor de meeste persoonsgegevens geeft de AVG geen vast aantal maanden of jaren. Het uitgangspunt is: niet langer bewaren dan nodig.",
    tip: "Tip: fiscale basisadministratie moet doorgaans 7 jaar worden bewaard. Voor contactaanvragen, accounts, intakes, berichten en analytics bepaal je een kortere termijn die past bij het doel. Nieuwsbriefgegevens kunnen worden bewaard zolang iemand is ingeschreven; een afmelding moet direct worden gerespecteerd.",
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
    id: 9,
    short: "Nieuwsbrief",
    title: "Hoe werkt de nieuwsbrief?",
    intro: "Dit antwoord heb je al gegeven en wordt ook technisch in de website doorgevoerd.",
    tip: "Belangrijk: losse inschrijvers moeten bewust opt-in geven en zich eenvoudig kunnen afmelden. Bestaande klanten kunnen onder voorwaarden reclame over soortgelijke eigen diensten ontvangen, maar ook zij moeten zich eenvoudig kunnen afmelden.",
    locked: true,
    fields: [
      { key: "q9_newsletter_policy", label: "Afgesproken nieuwsbriefbeleid", type: "textarea", required: true },
    ],
  },
  {
    id: 10,
    short: "Klachten",
    title: "Hoe wil je omgaan met klachten en geschillen?",
    intro: "Hiermee bepalen we de laatste basisafspraken voor de algemene voorwaarden.",
    tip: "Tip: een korte, duidelijke klachtenroute werkt meestal beter dan zware juridische taal. Leg vast waar iemand een klacht indient, binnen welke termijn je reageert en dat je eerst samen naar een oplossing zoekt.",
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

function stepComplete(step: Step, answers: LegalAnswers) {
  if (step.locked) return step.fields.every((field) => (answers[field.key] ?? "").trim().length > 0);
  return step.fields
    .filter((field) => field.required)
    .every((field) => (answers[field.key] ?? "").trim().length > 0);
}

export default function LegalQuestionnaire({ session }: { session: CmsSession }) {
  const [answers, setAnswers] = useState<LegalAnswers>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [localMessage, setLocalMessage] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    let active = true;
    void loadLegalQuestionnaire(session)
      .then((record) => {
        if (!active) return;
        setAnswers(record.answers ?? {});
        setActiveIndex(Math.max(0, Math.min(STEPS.length - 1, record.current_step ?? 0)));
        setSavedAt(record.updated_at);
      })
      .catch((error) => {
        if (!active) return;
        setLocalError(error instanceof Error ? error.message : "Vragenlijst kon niet worden geladen.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session]);

  const completed = useMemo(
    () => STEPS.filter((step) => stepComplete(step, answers)).length,
    [answers]
  );
  const progress = Math.round((completed / STEPS.length) * 100);
  const step = STEPS[activeIndex];

  function updateAnswer(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setLocalMessage("");
  }

  async function persist(nextIndex = activeIndex, message = "Antwoorden opgeslagen.") {
    setSaving(true);
    setLocalError("");
    setLocalMessage("");
    try {
      const record = await saveLegalQuestionnaire(session, answers, nextIndex);
      setSavedAt(record.updated_at);
      setLocalMessage(message);
      return true;
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Opslaan is mislukt.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function goTo(index: number) {
    if (index === activeIndex) return;
    const ok = await persist(index, "");
    if (ok) setActiveIndex(index);
  }

  async function next() {
    const nextIndex = Math.min(STEPS.length - 1, activeIndex + 1);
    const ok = await persist(nextIndex, "Antwoord opgeslagen.");
    if (ok && nextIndex !== activeIndex) setActiveIndex(nextIndex);
  }

  async function previous() {
    const nextIndex = Math.max(0, activeIndex - 1);
    const ok = await persist(nextIndex, "");
    if (ok) setActiveIndex(nextIndex);
  }

  if (loading) {
    return <div className={styles.legalLoading}>Juridische vragenlijst laden…</div>;
  }

  return (
    <div className={styles.legalWorkspace}>
      <section className={styles.legalOverview}>
        <div className={styles.legalOverviewCopy}>
          <p className={styles.eyebrow}>Privacyverklaring & algemene voorwaarden</p>
          <h2>Beantwoord dit stap voor stap.</h2>
          <p>
            Je antwoorden worden tussendoor opgeslagen. Als alles compleet is, kunnen hieruit de privacyverklaring
            en algemene voorwaarden worden opgesteld zonder ontbrekende informatie te hoeven raden.
          </p>
        </div>

        <div className={styles.legalProgressCard}>
          <div className={styles.legalProgressTop}>
            <strong>{progress}%</strong>
            <span>{completed} van {STEPS.length} onderdelen compleet</span>
          </div>
          <div className={styles.legalProgressTrack} aria-label={`${progress}% compleet`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>
            {completed === STEPS.length
              ? "Alle informatie is compleet."
              : "Vraag 7 en 9 zijn al vooraf ingevuld."}
          </small>
        </div>
      </section>

      <div className={styles.legalGrid}>
        <nav className={styles.legalSteps} aria-label="Juridische vragen">
          {STEPS.map((item, index) => {
            const done = stepComplete(item, answers);
            return (
              <button
                key={item.id}
                type="button"
                className={[
                  styles.legalStep,
                  activeIndex === index ? styles.legalStepActive : "",
                  done ? styles.legalStepDone : "",
                ].filter(Boolean).join(" ")}
                onClick={() => void goTo(index)}
                disabled={saving}
              >
                <span className={styles.legalStepNumber}>{String(item.id).padStart(2, "0")}</span>
                <span>
                  <strong>{item.short}</strong>
                  <small>{done ? "Compleet" : item.locked ? "Vooraf ingevuld" : "Nog invullen"}</small>
                </span>
                <i aria-hidden="true">{done ? "✓" : "→"}</i>
              </button>
            );
          })}
        </nav>

        <section className={styles.legalQuestionCard}>
          <div className={styles.legalQuestionHeader}>
            <div>
              <p className={styles.eyebrow}>Vraag {step.id} van {STEPS.length}</p>
              <h2>{step.title}</h2>
              <p>{step.intro}</p>
            </div>
            <span className={stepComplete(step, answers) ? styles.legalStatusDone : styles.legalStatusOpen}>
              {stepComplete(step, answers) ? "Compleet" : "Nog invullen"}
            </span>
          </div>

          {step.known && (
            <div className={styles.legalKnown}>
              <strong>Dit weet de website al</strong>
              <p>{step.known}</p>
            </div>
          )}

          <div className={styles.legalTip}>
            <span>Tip</span>
            <p>{step.tip}</p>
          </div>

          <div className={styles.legalFields}>
            {step.fields.map((field) => (
              <label key={field.key}>
                <span>
                  {field.label}
                  {field.required && !step.locked ? <em>verplicht</em> : null}
                </span>

                {field.type === "textarea" ? (
                  <textarea
                    rows={5}
                    value={answers[field.key] ?? ""}
                    onChange={(event) => updateAnswer(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    readOnly={step.locked}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={answers[field.key] ?? ""}
                    onChange={(event) => updateAnswer(field.key, event.target.value)}
                    disabled={step.locked}
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
                    readOnly={step.locked}
                  />
                )}

                {field.helper ? <small>{field.helper}</small> : null}
              </label>
            ))}
          </div>

          {(localMessage || localError) && (
            <p className={localError ? styles.legalInlineError : styles.legalInlineSuccess}>
              {localError || localMessage}
            </p>
          )}

          <div className={styles.legalQuestionFooter}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => void previous()}
              disabled={saving || activeIndex === 0}
            >
              ← Vorige
            </button>

            <div className={styles.legalSaveMeta}>
              {savedAt && <small>Laatst opgeslagen: {new Date(savedAt).toLocaleString("nl-NL")}</small>}
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => void persist(activeIndex)}
                disabled={saving}
              >
                {saving ? "Opslaan…" : "Alleen opslaan"}
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void next()}
                disabled={saving}
              >
                {activeIndex === STEPS.length - 1 ? "Opslaan" : "Opslaan en volgende →"}
              </button>
            </div>
          </div>

          {completed === STEPS.length && (
            <div className={styles.legalReady}>
              <span>✓</span>
              <div>
                <strong>Klaar om de documenten op te stellen</strong>
                <p>Alle benodigde antwoorden voor de eerste juridische conceptversie zijn ingevuld.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
