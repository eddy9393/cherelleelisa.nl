import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";

  const redirect = (status: string) =>
    NextResponse.redirect(new URL(`/nieuwsbrief?status=${encodeURIComponent(status)}`, request.url));

  if (!supabaseUrl || !supabaseKey || !uuidPattern.test(token)) {
    return redirect("invalid");
  }

  const tokenHeaders = {
    apikey: supabaseKey,
    "Content-Type": "application/json",
    "x-unsubscribe-token": token,
  };

  const lookup = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_newsletter_contacts?select=id,status&unsubscribe_token=eq.${encodeURIComponent(token)}&limit=1`,
    {
      headers: tokenHeaders,
      cache: "no-store",
    }
  );

  if (!lookup.ok) return redirect("error");

  const rows = await lookup.json() as Array<{ id: string; status: "subscribed" | "unsubscribed" }>;
  const row = rows[0];
  if (!row) return redirect("invalid");
  if (row.status === "unsubscribed") return redirect("unsubscribed");

  const update = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_newsletter_contacts?id=eq.${encodeURIComponent(row.id)}`,
    {
      method: "PATCH",
      headers: {
        ...tokenHeaders,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    }
  );

  return redirect(update.ok ? "unsubscribed" : "error");
}
