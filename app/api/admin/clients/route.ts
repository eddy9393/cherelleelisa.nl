import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const sender = "Cherelle Elisa <website@cherelleelisa.nl>";
const replyTo = "info@cherelleelisa.nl";

function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: NextRequest) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const authHeader = request.headers.get("authorization") ?? "";

  if (!resendApiKey || !supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { ok: false, error: "De klantuitnodiging is nog niet volledig geconfigureerd." },
      { status: 503 }
    );
  }

  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false, error: "Niet ingelogd." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const action = body.action === "resend" ? "resend" : "invite";
  const firstName = clean(body.first_name, 80);
  const lastName = clean(body.last_name, 100);
  const phone = clean(body.phone, 60);
  const email = clean(body.email, 254).toLowerCase();

  if (!email || (action === "invite" && (!firstName || !lastName))) {
    return NextResponse.json(
      { ok: false, error: "Voornaam, achternaam en e-mailadres zijn verplicht." },
      { status: 400 }
    );
  }

  const functionResponse = await fetch(`${supabaseUrl}/functions/v1/client-invite`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      apikey: supabaseKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, first_name: firstName, last_name: lastName, phone, email }),
    cache: "no-store",
  });

  let functionBody: Record<string, any> = {};
  try {
    functionBody = await functionResponse.json();
  } catch {
    functionBody = {};
  }

  if (!functionResponse.ok) {
    return NextResponse.json(
      { ok: false, error: functionBody.error || "Klantuitnodiging kon niet worden aangemaakt." },
      { status: functionResponse.status }
    );
  }

  const tokenHash = clean(functionBody.token_hash, 2000);
  const verificationType = clean(functionBody.type, 80) || "invite";
  const client = functionBody.client ?? null;

  if (!tokenHash || !client?.email) {
    return NextResponse.json(
      { ok: false, error: "De uitnodiging kon niet veilig worden opgebouwd." },
      { status: 502 }
    );
  }

  const inviteUrl = new URL("/account/setup", request.nextUrl.origin);
  inviteUrl.searchParams.set("token_hash", tokenHash);
  inviteUrl.searchParams.set("type", verificationType);

  const displayName = clean(client.name || [firstName, lastName].filter(Boolean).join(" "), 160);
  const greetingName = firstName || displayName.split(/\s+/)[0] || "vrouw";
  const safeName = escapeHtml(greetingName);
  const safeInviteUrl = escapeHtml(inviteUrl.toString());

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f7f1ea;font-family:Arial,Helvetica,sans-serif;color:#2f241d;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7f1ea">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="padding:44px 38px 12px;font-family:Georgia,'Times New Roman',serif;font-size:16px;letter-spacing:3px;color:#4a3a32;">
              CHERELLE ELISA
            </td>
          </tr>
          <tr>
            <td style="padding:12px 38px 8px;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:44px;color:#2f241d;">
              Welkom in jouw persoonlijke omgeving.
            </td>
          </tr>
          <tr>
            <td style="padding:12px 38px 0;font-size:15px;line-height:25px;color:#5a4a40;">
              Lieve ${safeName},
            </td>
          </tr>
          <tr>
            <td style="padding:10px 38px 0;font-size:15px;line-height:25px;color:#5a4a40;">
              Wat bijzonder dat je ‘ja’ hebt gezegd tegen jezelf. Via jouw persoonlijke omgeving kun je rustig je intake invullen en alle voorbereiding en contra-indicaties voor jouw sessie teruglezen.
            </td>
          </tr>
          <tr>
            <td style="padding:28px 38px 10px;">
              <a href="${safeInviteUrl}" style="display:inline-block;padding:14px 20px;background:#a86f5d;color:#ffffff;text-decoration:none;border-radius:18px 18px 18px 5px;font-family:Georgia,'Times New Roman',serif;font-size:16px;">
                Maak jouw wachtwoord aan
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 38px 38px;font-size:12px;line-height:20px;color:#8a766a;">
              Deze link is persoonlijk. Deel hem niet met anderen. Werkt de link niet meer, neem dan contact op met Cherelle zodat er een nieuwe uitnodiging kan worden verstuurd.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "Cherelle Elisa",
    "",
    `Lieve ${greetingName},`,
    "",
    "Wat bijzonder dat je ‘ja’ hebt gezegd tegen jezelf.",
    "Via jouw persoonlijke omgeving kun je je intake invullen en de voorbereiding en contra-indicaties teruglezen.",
    "",
    "Maak hier jouw wachtwoord aan:",
    inviteUrl.toString(),
    "",
    "Deze link is persoonlijk. Deel hem niet met anderen.",
  ].join("\n");

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: [client.email],
      reply_to: replyTo,
      subject: action === "resend"
        ? "Nieuwe toegang tot jouw persoonlijke omgeving — Cherelle Elisa"
        : "Welkom bij Cherelle Elisa — maak jouw persoonlijke omgeving klaar",
      html,
      text,
    }),
  });

  if (!emailResponse.ok) {
    console.error("Resend client invite error", emailResponse.status, await emailResponse.text());
    return NextResponse.json(
      {
        ok: false,
        client,
        error: "Het klantaccount is aangemaakt, maar de uitnodigingsmail kon niet worden verzonden. Gebruik ‘Opnieuw uitnodigen’.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, client });
}
