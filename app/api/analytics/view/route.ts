import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function looksAutomated(userAgent: string) {
  return /bot|crawler|spider|headless|lighthouse|pagespeed|preview|prerender|facebookexternalhit|whatsapp|slackbot|discordbot/i.test(userAgent);
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const fetchSite = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");

  if (looksAutomated(userAgent)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (fetchSite && fetchSite !== "same-origin") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sessionId = clean(body.session_id, 100);
  const path = clean(body.path, 300);
  const referrer = clean(body.referrer, 500) || null;
  const engaged = body.engaged === true;

  if (!engaged || sessionId.length < 8 || !path.startsWith("/")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (
    path.startsWith("/admin") ||
    path.startsWith("/account") ||
    path.startsWith("/mijn-account") ||
    path.startsWith("/api/")
  ) {
    return NextResponse.json({ ok: true });
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/cherelle_page_views`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      session_id: sessionId,
      path,
      referrer,
      verified: true,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
