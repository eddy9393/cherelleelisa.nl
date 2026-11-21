import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const allowedKeys = new Set([
  "q1_trade_name","q1_owner_name","q1_address","q1_kvk","q1_vat","q1_email","q1_phone",
  "q2_services","q2_business_customers","q2_custom_notes",
  "q3_booking_final","q3_payment_moment","q3_installments","q3_payment_term","q3_vat","q3_late_payment",
  "q4_free_cancel","q4_late_cancel","q4_reschedule","q4_no_show","q4_retreats","q4_distance_sales","q4_start_within_14",
  "q5_service_type","q5_medical_disclaimer","q5_contraindications","q5_refuse","q5_stop_trajectory",
  "q6_contact_purpose","q6_account_purpose","q6_intake_purpose","q6_payment_purpose","q6_analytics_purpose","q6_corrections",
  "q8_contact","q8_accounts","q8_intakes","q8_messages","q8_newsletter","q8_analytics","q8_financial",
  "q10_complaint_channel","q10_response_time","q10_mutual_solution","q10_law","q10_disputes"
]);

const optionalKeys = new Set(["q1_vat","q2_custom_notes"]);
const requiredKeys = Array.from(allowedKeys).filter((key) => !optionalKeys.has(key));

function config() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return { supabaseUrl, supabaseKey };
}

function tokenFrom(request: NextRequest) {
  return request.headers.get("x-questionnaire-token")?.trim() ?? "";
}

function supabaseHeaders(key: string, token: string, prefer?: string) {
  return {
    apikey: key,
    "Content-Type": "application/json",
    "x-questionnaire-token": token,
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function sanitizeAnswers(value: unknown) {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

  const result: Record<string, string> = {};
  for (const [key, raw] of Object.entries(source)) {
    if (!allowedKeys.has(key)) continue;
    result[key] = String(raw ?? "").trim().slice(0, 6000);
  }
  return result;
}

function isComplete(answers: Record<string, string>) {
  return requiredKeys.every((key) => (answers[key] ?? "").trim().length > 0);
}

export async function GET(request: NextRequest) {
  const token = tokenFrom(request);
  const { supabaseUrl, supabaseKey } = config();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, error: "Vragenlijst is tijdelijk niet beschikbaar." }, { status: 503 });
  }
  if (!uuidPattern.test(token)) {
    return NextResponse.json({ ok: false, error: "Ongeldige invulsessie." }, { status: 400 });
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_legal_questionnaire_sessions?select=answers,current_question,updated_at,completed_at&session_token=eq.${encodeURIComponent(token)}&limit=1`,
    {
      headers: supabaseHeaders(supabaseKey, token),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return NextResponse.json({ ok: false, error: "Voortgang kon niet worden geladen." }, { status: 502 });
  }

  const rows = await response.json() as Array<{
    answers: Record<string, string>;
    current_question: number;
    updated_at: string;
    completed_at: string | null;
  }>;

  return NextResponse.json({
    ok: true,
    exists: Boolean(rows[0]),
    questionnaire: rows[0] ?? null,
  });
}

export async function POST(request: NextRequest) {
  const token = tokenFrom(request);
  const { supabaseUrl, supabaseKey } = config();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, error: "Vragenlijst is tijdelijk niet beschikbaar." }, { status: 503 });
  }
  if (!uuidPattern.test(token)) {
    return NextResponse.json({ ok: false, error: "Ongeldige invulsessie." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const answers = sanitizeAnswers(body.answers);
  const currentQuestion = Math.max(0, Math.min(7, Number(body.current_question ?? 0) || 0));
  const completed = isComplete(answers);
  const now = new Date().toISOString();

  const lookup = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_legal_questionnaire_sessions?select=id&session_token=eq.${encodeURIComponent(token)}&limit=1`,
    {
      headers: supabaseHeaders(supabaseKey, token),
      cache: "no-store",
    }
  );

  if (!lookup.ok) {
    return NextResponse.json({ ok: false, error: "Invulsessie kon niet worden gecontroleerd." }, { status: 502 });
  }

  const existing = await lookup.json() as Array<{ id: string }>;
  const url = existing[0]
    ? `${supabaseUrl}/rest/v1/cherelle_legal_questionnaire_sessions?id=eq.${encodeURIComponent(existing[0].id)}`
    : `${supabaseUrl}/rest/v1/cherelle_legal_questionnaire_sessions`;

  const response = await fetch(url, {
    method: existing[0] ? "PATCH" : "POST",
    headers: supabaseHeaders(supabaseKey, token, "return=representation"),
    body: JSON.stringify({
      ...(existing[0] ? {} : { session_token: token }),
      answers,
      current_question: currentQuestion,
      updated_at: now,
      completed_at: completed ? now : null,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false, error: "Antwoorden konden niet worden opgeslagen." }, { status: 502 });
  }

  const rows = await response.json() as Array<{
    answers: Record<string, string>;
    current_question: number;
    updated_at: string;
    completed_at: string | null;
  }>;

  return NextResponse.json({
    ok: true,
    questionnaire: rows[0],
    completed,
  });
}
