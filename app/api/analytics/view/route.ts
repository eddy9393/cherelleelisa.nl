import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false }, { status: 503 });
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

  if (sessionId.length < 8 || !path.startsWith("/")) {
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
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
