import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const recipient = "info@cherelleelisa.nl";
const sender = "Cherelle Elisa Website <website@cherelleelisa.nl>";

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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "E-mailservice is niet geconfigureerd." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }

  // Honeypot for basic bot protection.
  if (clean(body.company, 120)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 180).toLowerCase();
  const phone = clean(body.phone, 80);
  const interest = clean(body.interest, 120);
  const message = clean(body.message, 5000);
  const language = body.language === "en" ? "en" : "nl";

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Naam, e-mailadres en bericht zijn verplicht." },
      { status: 400 }
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Vul een geldig e-mailadres in." },
      { status: 400 }
    );
  }

  const subject =
    language === "nl"
      ? `Kennismaking via cherelleelisa.nl — ${interest || "algemene vraag"}`
      : `Introduction via cherelleelisa.nl — ${interest || "general question"}`;

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    phone: escapeHtml(phone),
    interest: escapeHtml(interest),
    message: escapeHtml(message).replace(/\n/g, "<br />"),
  };

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin:0;padding:0;background-color:#f7f1ea;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7f1ea" style="width:100%;background-color:#f7f1ea;">
    <tr>
      <td align="center" style="padding-top:32px;padding-right:16px;padding-bottom:32px;padding-left:16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:14px;">
          <tr>
            <td style="padding-top:32px;padding-right:32px;padding-bottom:12px;padding-left:32px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:34px;color:#2f241d;">
              Nieuwe aanvraag via cherelleelisa.nl
            </td>
          </tr>
          <tr>
            <td style="padding-top:0;padding-right:32px;padding-bottom:28px;padding-left:32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#5a4a40;">
              Er is een nieuw bericht verstuurd via het contactformulier.
            </td>
          </tr>
          <tr>
            <td style="padding-top:0;padding-right:32px;padding-bottom:32px;padding-left:32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding-top:8px;padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#855747;"><strong>Naam</strong></td><td style="padding-top:8px;padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#2f241d;">${safe.name}</td></tr>
                <tr><td style="padding-top:8px;padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#855747;"><strong>E-mail</strong></td><td style="padding-top:8px;padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#2f241d;">${safe.email}</td></tr>
                ${safe.phone ? `<tr><td style="padding-top:8px;padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#855747;"><strong>Telefoon</strong></td><td style="padding-top:8px;padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#2f241d;">${safe.phone}</td></tr>` : ""}
                ${safe.interest ? `<tr><td style="padding-top:8px;padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#855747;"><strong>Interesse</strong></td><td style="padding-top:8px;padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#2f241d;">${safe.interest}</td></tr>` : ""}
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
                <tr>
                  <td style="padding-top:18px;padding-right:20px;padding-bottom:18px;padding-left:20px;background-color:#f7f1ea;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#2f241d;">
                    ${safe.message}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "Nieuwe aanvraag via cherelleelisa.nl",
    "",
    `Naam: ${name}`,
    `E-mail: ${email}`,
    phone ? `Telefoon: ${phone}` : "",
    interest ? `Interesse: ${interest}` : "",
    "",
    message,
  ].filter(Boolean).join("\n");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      reply_to: email,
      subject,
      html,
      text,
    }),
  });

  if (!resendResponse.ok) {
    console.error("Resend contact error", resendResponse.status, await resendResponse.text());
    return NextResponse.json(
      { ok: false, error: "Het bericht kon niet worden verzonden." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
