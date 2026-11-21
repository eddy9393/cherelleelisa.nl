import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, error: "Nieuwsbrief is tijdelijk niet beschikbaar." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const firstName = clean(body.first_name, 100);
  const email = clean(body.email, 320).toLowerCase();
  const consent = body.consent === true;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Vul een geldig e-mailadres in." }, { status: 400 });
  }

  if (!consent) {
    return NextResponse.json({ ok: false, error: "Bevestig dat je de nieuwsbrief wilt ontvangen." }, { status: 400 });
  }

  const consentText = "Ik wil de nieuwsbrief van Cherelle Elisa ontvangen en weet dat ik mij op ieder moment kan afmelden.";

  const response = await fetch(`${supabaseUrl}/rest/v1/cherelle_newsletter_contacts`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      email,
      first_name: firstName || null,
      kind: "subscriber",
      client_id: null,
      status: "subscribed",
      source: "website",
      consent_text: consentText,
      subscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });

  if (response.ok) {
    return NextResponse.json({ ok: true });
  }

  const errorBody = await response.json().catch(() => null);
  if (response.status === 409 || errorBody?.code === "23505") {
    return NextResponse.json({
      ok: true,
      already_subscribed: true,
    });
  }

  return NextResponse.json(
    { ok: false, error: "Inschrijven is niet gelukt. Probeer het later opnieuw." },
    { status: 502 }
  );
}
