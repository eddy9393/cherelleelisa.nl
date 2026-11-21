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

type ClientRow = {
  id: string;
  name: string;
  email: string;
};

type ContactRow = {
  id: string;
  email: string;
  first_name: string | null;
  kind: "client" | "subscriber";
  client_id: string | null;
  status: "subscribed" | "unsubscribed";
  unsubscribe_token: string;
};

type Recipient = {
  name: string;
  email: string;
  unsubscribeToken: string;
};

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
  const newsletterBody = clean(body.body, 12000);
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const recipientKeys = Array.isArray(body.recipient_keys)
    ? Array.from(
        new Set(
          body.recipient_keys
            .map((value) => clean(value, 100))
            .filter((value) => /^(client|subscriber):/.test(value))
        )
      )
    : [];

  const clientIds = recipientKeys
    .filter((key) => key.startsWith("client:"))
    .map((key) => key.slice("client:".length))
    .filter((id) => uuidPattern.test(id));

  const subscriberIds = recipientKeys
    .filter((key) => key.startsWith("subscriber:"))
    .map((key) => key.slice("subscriber:".length))
    .filter((id) => uuidPattern.test(id));

  const allowedImagePrefix = `${supabaseUrl}/storage/v1/object/public/cherelle-media/newsletters/`;
  const imageUrls = Array.isArray(body.image_urls)
    ? body.image_urls
        .map((value) => clean(value, 1200))
        .filter((value) => value.startsWith(allowedImagePrefix))
    : [];

  if (!subject || !newsletterBody || recipientKeys.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Onderwerp, bericht en minimaal één ontvanger zijn verplicht." },
      { status: 400 }
    );
  }

  if (recipientKeys.length > 250) {
    return NextResponse.json({ ok: false, error: "Selecteer maximaal 250 ontvangers per verzending." }, { status: 400 });
  }

  let clients: ClientRow[] = [];
  if (clientIds.length > 0) {
    const ids = clientIds.map((id) => encodeURIComponent(id)).join(",");
    const clientsResponse = await fetch(
      `${supabaseUrl}/rest/v1/cherelle_clients?select=id,name,email&id=in.(${ids})`,
      { headers: commonHeaders, cache: "no-store" }
    );

    if (!clientsResponse.ok) {
      return NextResponse.json({ ok: false, error: "Klanten konden niet worden geladen." }, { status: 502 });
    }
    clients = await clientsResponse.json() as ClientRow[];
  }

  let clientContacts: ContactRow[] = [];
  if (clientIds.length > 0) {
    const ids = clientIds.map((id) => encodeURIComponent(id)).join(",");
    const response = await fetch(
      `${supabaseUrl}/rest/v1/cherelle_newsletter_contacts?select=id,email,first_name,kind,client_id,status,unsubscribe_token&kind=eq.client&client_id=in.(${ids})`,
      { headers: commonHeaders, cache: "no-store" }
    );
    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "Nieuwsbriefvoorkeuren konden niet worden geladen." }, { status: 502 });
    }
    clientContacts = await response.json() as ContactRow[];
  }

  const contactByClient = new Map(
    clientContacts
      .filter((contact) => contact.client_id)
      .map((contact) => [contact.client_id as string, contact])
  );

  const missingContacts = clients.filter((client) => !contactByClient.has(client.id));
  if (missingContacts.length > 0) {
    const response = await fetch(`${supabaseUrl}/rest/v1/cherelle_newsletter_contacts`, {
      method: "POST",
      headers: {
        ...commonHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify(
        missingContacts.map((client) => ({
          email: client.email.trim().toLowerCase(),
          first_name: client.name.trim().split(/\s+/)[0] || null,
          kind: "client",
          client_id: client.id,
          status: "subscribed",
          source: "client",
          consent_text: null,
        }))
      ),
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "Afmeldlinks voor klanten konden niet worden voorbereid." }, { status: 502 });
    }

    const created = await response.json() as ContactRow[];
    for (const contact of created) {
      if (contact.client_id) contactByClient.set(contact.client_id, contact);
    }
  }

  let subscriberContacts: ContactRow[] = [];
  if (subscriberIds.length > 0) {
    const ids = subscriberIds.map((id) => encodeURIComponent(id)).join(",");
    const response = await fetch(
      `${supabaseUrl}/rest/v1/cherelle_newsletter_contacts?select=id,email,first_name,kind,client_id,status,unsubscribe_token&id=in.(${ids})&kind=eq.subscriber&status=eq.subscribed`,
      { headers: commonHeaders, cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "Losse nieuwsbriefinschrijvers konden niet worden geladen." }, { status: 502 });
    }
    subscriberContacts = await response.json() as ContactRow[];
  }

  const recipients: Recipient[] = [];
  const seenEmails = new Set<string>();
  let skippedUnsubscribed = 0;

  for (const client of clients) {
    const contact = contactByClient.get(client.id);
    if (!contact) continue;
    if (contact.status === "unsubscribed") {
      skippedUnsubscribed += 1;
      continue;
    }

    const normalized = client.email.trim().toLowerCase();
    if (!normalized || seenEmails.has(normalized)) continue;
    seenEmails.add(normalized);
    recipients.push({
      name: client.name,
      email: client.email,
      unsubscribeToken: contact.unsubscribe_token,
    });
  }

  for (const contact of subscriberContacts) {
    const normalized = contact.email.trim().toLowerCase();
    if (!normalized || seenEmails.has(normalized)) continue;
    seenEmails.add(normalized);
    recipients.push({
      name: contact.first_name?.trim() || "",
      email: contact.email,
      unsubscribeToken: contact.unsubscribe_token,
    });
  }

  if (recipients.length === 0) {
    return NextResponse.json({ ok: false, error: "Geen ingeschreven ontvangers gevonden." }, { status: 400 });
  }

  const safeSubject = escapeHtml(subject);
  const safeContent = escapeHtml(newsletterBody).replace(/\n/g, "<br />");
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

  const sendOne = async (recipient: Recipient) => {
    const firstName = recipient.name.trim().split(/\s+/)[0] || "vrouw";
    const unsubscribeUrl = `${request.nextUrl.origin}/api/newsletter/unsubscribe?token=${encodeURIComponent(recipient.unsubscribeToken)}`;
    const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl);

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
            <td style="padding:0 38px 24px;font-size:13px;line-height:22px;color:#8a766a;">
              Liefs,<br />Cherelle Elisa
            </td>
          </tr>
          <tr>
            <td style="padding:18px 38px 34px;border-top:1px solid #eee4dc;font-size:11px;line-height:18px;color:#9a887d;">
              Je ontvangt deze nieuwsbrief van Cherelle Elisa.
              <a href="${safeUnsubscribeUrl}" style="color:#855747;text-decoration:underline;">Afmelden</a>
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
        to: [recipient.email],
        reply_to: "info@cherelleelisa.nl",
        subject,
        html,
        text: `Lieve ${firstName},\n\n${newsletterBody}\n\nLiefs,\nCherelle Elisa\n\nAfmelden: ${unsubscribeUrl}`,
      }),
    });
  };

  const failed: string[] = [];
  for (let index = 0; index < recipients.length; index += 5) {
    const batch = recipients.slice(index, index + 5);
    const results = await Promise.all(batch.map(async (recipient) => {
      const response = await sendOne(recipient);
      return { recipient, ok: response.ok };
    }));

    for (const result of results) {
      if (!result.ok) failed.push(result.recipient.email);
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
      body: newsletterBody,
      image_urls: imageUrls,
      recipient_count: recipients.length,
      sent_by: user.id,
    }),
  });

  if (!logResponse.ok) {
    console.error("Newsletter sent but logging failed");
  }

  return NextResponse.json({
    ok: true,
    sent: recipients.length,
    skipped_unsubscribed: skippedUnsubscribed,
  });
}
