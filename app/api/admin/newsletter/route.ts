import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
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
    return NextResponse.json({ ok: false, error: "Serverconfiguratie ontbreekt." }, { status: 503 });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false, error: "Niet ingelogd." }, { status: 401 });
  }

  const commonHeaders = {
    apikey: supabaseKey,
    Authorization: authHeader,
    "Content-Type": "application/json",
  };

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: commonHeaders,
    cache: "no-store",
  });

  if (!userResponse.ok) {
    return NextResponse.json({ ok: false, error: "Beheersessie is ongeldig." }, { status: 401 });
  }

  const user = await userResponse.json();

  const adminResponse = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
    { headers: commonHeaders, cache: "no-store" }
  );

  if (!adminResponse.ok || (await adminResponse.json()).length === 0) {
    return NextResponse.json({ ok: false, error: "Geen beheerrechten." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const subject = clean(body.subject, 180);
  const content = clean(body.body, 12000);
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const recipientIds = Array.isArray(body.recipient_ids)
    ? body.recipient_ids
        .map((value) => clean(value, 80))
        .filter((value) => uuidPattern.test(value))
    : [];

  const allowedImagePrefix = `${supabaseUrl}/storage/v1/object/public/cherelle-media/newsletters/`;
  const imageUrls = Array.isArray(body.image_urls)
    ? body.image_urls
        .map((value) => clean(value, 1200))
        .filter((value) => value.startsWith(allowedImagePrefix))
    : [];

  if (!subject || !content || recipientIds.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Onderwerp, bericht en minimaal één ontvanger zijn verplicht." },
      { status: 400 }
    );
  }

  if (recipientIds.length > 250) {
    return NextResponse.json({ ok: false, error: "Selecteer maximaal 250 ontvangers per verzending." }, { status: 400 });
  }

  const ids = recipientIds.map((id) => encodeURIComponent(id)).join(",");
  const clientsResponse = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_clients?select=id,name,email&id=in.(${ids})`,
    { headers: commonHeaders, cache: "no-store" }
  );

  if (!clientsResponse.ok) {
    return NextResponse.json({ ok: false, error: "Ontvangers konden niet worden geladen." }, { status: 502 });
  }

  const clients = await clientsResponse.json() as Array<{ id: string; name: string; email: string }>;
  if (!clients.length) {
    return NextResponse.json({ ok: false, error: "Geen geldige ontvangers gevonden." }, { status: 400 });
  }

  const safeSubject = escapeHtml(subject);
  const safeContent = escapeHtml(content).replace(/\n/g, "<br />");
  const safeImages = imageUrls
    .map(
      (url) => `
          <tr>
            <td style="padding:0 38px 18px;">
              <img src="${escapeHtml(url)}" alt="" width="564" border="0" style="display:block;width:100%;max-width:564px;height:auto;border-radius:14px;" />
            </td>
          </tr>`
    )
    .join("");

  const sendOne = async (client: { name: string; email: string }) => {
    const firstName = client.name.trim().split(/\s+/)[0] || "lieve vrouw";
    const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7f1ea;font-family:Arial,Helvetica,sans-serif;color:#2f241d;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7f1ea">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width:640px;background:#ffffff;border-radius:18px;">
          <tr>
            <td style="padding:42px 38px 10px;font-family:Georgia,'Times New Roman',serif;font-size:15px;letter-spacing:3px;">CHERELLE ELISA</td>
          </tr>
          <tr>
            <td style="padding:10px 38px 0;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:42px;">${safeSubject}</td>
          </tr>
          <tr>
            <td style="padding:26px 38px 0;font-size:15px;line-height:25px;color:#5a4a40;">Lieve ${escapeHtml(firstName)},</td>
          </tr>
          <tr>
            <td style="padding:12px 38px 28px;font-size:15px;line-height:25px;color:#5a4a40;">${safeContent}</td>
          </tr>
          ${safeImages}
          <tr>
            <td style="padding:0 38px 42px;font-size:13px;line-height:22px;color:#8a766a;">
              Liefs,<br />Cherelle
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cherelle Elisa <info@cherelleelisa.nl>",
        to: [client.email],
        reply_to: "info@cherelleelisa.nl",
        subject,
        html,
        text: `Lieve ${firstName},\n\n${content}\n\nLiefs,\nCherelle`,
      }),
    });
  };

  const failed: string[] = [];
  for (let index = 0; index < clients.length; index += 5) {
    const batch = clients.slice(index, index + 5);
    const results = await Promise.all(batch.map(async (client) => {
      const response = await sendOne(client);
      return { client, ok: response.ok };
    }));

    for (const result of results) {
      if (!result.ok) failed.push(result.client.email);
    }
  }

  if (failed.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `${failed.length} nieuwsbrief${failed.length === 1 ? "" : "en"} konden niet worden verstuurd.`,
      },
      { status: 502 }
    );
  }

  const logResponse = await fetch(`${supabaseUrl}/rest/v1/cherelle_newsletters`, {
    method: "POST",
    headers: {
      ...commonHeaders,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      subject,
      body: content,
      image_urls: imageUrls,
      recipient_count: clients.length,
      sent_by: user.id,
    }),
  });

  if (!logResponse.ok) {
    console.error("Newsletter sent but logging failed");
  }

  return NextResponse.json({ ok: true, sent: clients.length });
}
