import type { CmsSession } from "./cherelleCms";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

function headers(accessToken?: string) {
  const result: Record<string, string> = {
    apikey: supabaseKey,
    "Content-Type": "application/json",
  };
  if (accessToken) result.Authorization = `Bearer ${accessToken}`;
  return result;
}

async function responseError(response: Response) {
  try {
    const body = await response.json();
    return body?.message || body?.error_description || body?.error || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export type LegalAnswers = Record<string, string>;

export type LegalQuestionnaire = {
  id: "main";
  answers: LegalAnswers;
  current_step: number;
  updated_at: string;
};

export type NewsletterAudienceRecipient = {
  key: string;
  name: string;
  email: string;
  kind: "client" | "subscriber";
};

export async function loadLegalQuestionnaire(session: CmsSession): Promise<LegalQuestionnaire> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_legal_questionnaire?select=id,answers,current_step,updated_at&id=eq.main&limit=1`,
    {
      headers: headers(session.access_token),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
  const rows = await response.json() as LegalQuestionnaire[];

  return rows[0] ?? {
    id: "main",
    answers: {},
    current_step: 0,
    updated_at: new Date(0).toISOString(),
  };
}

export async function saveLegalQuestionnaire(
  session: CmsSession,
  answers: LegalAnswers,
  currentStep: number
): Promise<LegalQuestionnaire> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_legal_questionnaire?on_conflict=id`,
    {
      method: "POST",
      headers: {
        ...headers(session.access_token),
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        id: "main",
        answers,
        current_step: Math.max(0, Math.min(9, currentStep)),
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
  const rows = await response.json() as LegalQuestionnaire[];
  if (!rows[0]) throw new Error("Juridische vragenlijst kon niet worden opgeslagen.");
  return rows[0];
}

export async function loadNewsletterAudience(
  session: CmsSession
): Promise<NewsletterAudienceRecipient[]> {
  const [clientsResponse, contactsResponse] = await Promise.all([
    fetch(
      `${supabaseUrl}/rest/v1/cherelle_clients?select=id,name,email&order=name.asc`,
      { headers: headers(session.access_token), cache: "no-store" }
    ),
    fetch(
      `${supabaseUrl}/rest/v1/cherelle_newsletter_contacts?select=id,email,first_name,kind,client_id,status,created_at&order=created_at.asc`,
      { headers: headers(session.access_token), cache: "no-store" }
    ),
  ]);

  if (!clientsResponse.ok || !contactsResponse.ok) {
    throw new Error("Nieuwsbriefontvangers konden niet worden geladen.");
  }

  const clients = await clientsResponse.json() as Array<{ id: string; name: string; email: string }>;
  const contacts = await contactsResponse.json() as Array<{
    id: string;
    email: string;
    first_name: string | null;
    kind: "client" | "subscriber";
    client_id: string | null;
    status: "subscribed" | "unsubscribed";
    created_at: string;
  }>;

  const clientPreferences = new Map(
    contacts
      .filter((item) => item.kind === "client" && item.client_id)
      .map((item) => [item.client_id as string, item])
  );

  const result: NewsletterAudienceRecipient[] = [];
  const seenEmails = new Set<string>();

  for (const client of clients) {
    const preference = clientPreferences.get(client.id);
    if (preference?.status === "unsubscribed") continue;

    const normalized = client.email.trim().toLowerCase();
    if (!normalized || seenEmails.has(normalized)) continue;
    seenEmails.add(normalized);

    result.push({
      key: `client:${client.id}`,
      name: client.name,
      email: client.email,
      kind: "client",
    });
  }

  for (const contact of contacts) {
    if (contact.kind !== "subscriber" || contact.status !== "subscribed") continue;
    const normalized = contact.email.trim().toLowerCase();
    if (!normalized || seenEmails.has(normalized)) continue;
    seenEmails.add(normalized);

    result.push({
      key: `subscriber:${contact.id}`,
      name: contact.first_name?.trim() || contact.email,
      email: contact.email,
      kind: "subscriber",
    });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name, "nl"));
}
