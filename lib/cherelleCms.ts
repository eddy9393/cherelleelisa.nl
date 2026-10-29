export type CmsLanguage = "nl" | "en";

export type CmsCopy = {
  nl: string;
  en: string;
};

export type CmsContentMap = Record<string, CmsCopy>;

export type CmsReview = {
  id: string;
  name: string;
  role_nl: string | null;
  role_en: string | null;
  quote_nl: string;
  quote_en: string;
  is_published: boolean;
  sort_order: number;
};

export type CmsMedia = {
  slot: string;
  storage_path: string;
  public_url: string;
  alt_nl: string | null;
  alt_en: string | null;
};

export type CmsSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email?: string;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const sessionKey = "cherelle-cms-session";

export const isCmsConfigured = Boolean(supabaseUrl && supabaseKey);

export const DEFAULT_HOMEPAGE_CONTENT: CmsContentMap = {
  hero_sentence_1: {
    nl: "Je bent al zo lang sterk geweest.",
    en: "You have been strong for so long.",
  },
  hero_sentence_2: {
    nl: "Maar ben je ook Zacht geweest voor jezelf?",
    en: "But have you also been gentle with yourself?",
  },
  hero_subtitle: {
    nl: "Voor de vrouw die alles draagt en zichzelf onderweg is kwijtgeraakt.",
    en: "For the woman who carries everything and lost herself along the way.",
  },
  hero_cta: { nl: "Herkenbaar?", en: "Recognize this?" },
  quote_bar: {
    nl: "Van hoofd naar hart. Van doen naar zijn. Van controle naar overgave.",
    en: "From head to heart. From doing to being. From control to surrender.",
  },

  recognition_kicker: { nl: "Herkenning", en: "Recognition" },
  recognition_title: { nl: "Herken je dit?", en: "Does this feel familiar?" },
  recognition_body: {
    nl: "Je staat altijd klaar, voor je werk, je gezin en iedereen om je heen. ’s Avonds lig je in bed en je hoofd blijft maar doorgaan. Je bent moe, al zo lang dat je bijna vergeten bent hoe het anders voelde. Van buiten ziet je leven er goed uit, en toch vraag je je soms af waarom jij dat geluk niet voelt.",
    en: "You are always there for your work, your family and everyone around you. At night you lie in bed while your mind keeps going. You are tired, for so long that you have almost forgotten what it felt like to feel different. From the outside your life looks good, yet sometimes you wonder why you do not feel that happiness.",
  },
  recognition_emphasis: {
    nl: "Er is niets mis met je. Je hebt alleen heel lang gezocht op een plek waar het niet te vinden is.",
    en: "There is nothing wrong with you. You have simply been searching for a long time in a place where it cannot be found.",
  },
  recognition_cta: {
    nl: "Lees verder over herkenning",
    en: "Read more about recognition",
  },

  homecoming_kicker: { nl: "Wat er mogelijk is", en: "What becomes possible" },
  homecoming_title: {
    nl: "Thuiskomen in je lichaam",
    en: "Coming home to your body",
  },
  homecoming_body: {
    nl: "Stel je voor dat je weer voelt wat je nodig hebt, en daar ook naar durft te handelen. Dat je nee kunt zeggen zonder schuldgevoel en hulp kunt aannemen zonder dat het ongemakkelijk voelt. Dat je rust neemt omdat je moe bent, en dat er weer ruimte is voor plezier, sensualiteit en vrijheid.",
    en: "Imagine feeling what you need again, and daring to act on it. Saying no without guilt and accepting help without discomfort. Resting because you are tired, while making space again for pleasure, sensuality and freedom.",
  },
  homecoming_manifesto: {
    nl: "Van hoofd naar hart.\nVan doen naar zijn.\nVan controle naar overgave.",
    en: "From head to heart.\nFrom doing to being.\nFrom control to surrender.",
  },
  homecoming_cta: {
    nl: "Ontdek wat thuiskomen betekent",
    en: "Discover what coming home means",
  },

  guidance_kicker: { nl: "Zo kan ik je begeleiden", en: "How I can support you" },
  guidance_title: {
    nl: "Een vorm die past bij waar jij nu bent.",
    en: "A form of support that meets you where you are.",
  },
  guidance_1_title: { nl: "The Feminine Way", en: "The Feminine Way" },
  guidance_1_body: {
    nl: "Een persoonlijk traject van zes maanden waarin je stap voor stap terugkomt in je lichaam en weer leert leven vanuit je vrouwelijke energie. Volledig afgestemd op jou en in jouw tempo. Veel vrouwen merken dat ze na dit traject rustiger zijn, beter voelen wat ze nodig hebben en weer kunnen ontvangen.",
    en: "A personal six-month journey in which you gradually return to your body and learn to live from your feminine energy again. Fully tailored to you and at your pace. Many women notice they feel calmer, sense what they need more clearly and are able to receive again.",
  },
  guidance_1_cta: { nl: "Lees meer", en: "Read more" },
  guidance_2_title: { nl: "1-op-1 sessie", en: "1-to-1 session" },
  guidance_2_body: {
    nl: "Een sessie van ongeveer anderhalf uur waarin we samen werken met wat er op dat moment in jou leeft. Ook mogelijk samen met je partner, vriendin of moeder.",
    en: "A session of around ninety minutes in which we work together with whatever is alive in you at that moment. Also possible together with your partner, a friend or your mother.",
  },
  guidance_2_cta: { nl: "Bekijk sessies", en: "View sessions" },
  guidance_3_title: { nl: "Ceremonies", en: "Ceremonies" },
  guidance_3_body: {
    nl: "Samen met andere vrouwen ruimte maken om te voelen, los te laten en te verbinden.",
    en: "Creating space with other women to feel, let go and connect.",
  },
  guidance_3_cta: { nl: "Bekijk ceremonies", en: "View ceremonies" },

  approach_kicker: { nl: "Mijn manier van werken", en: "My approach" },
  approach_body: {
    nl: "We werken altijd in jouw tempo. Soms raken we diepe lagen aan, zoals oude patronen of wat je van thuis hebt meegekregen. Daar ga ik zorgvuldig mee om, zodat het veilig voelt en je niets hoeft te forceren.",
    en: "We always work at your pace. Sometimes we touch deeper layers, such as old patterns or things you learned at home. I approach those carefully, so it feels safe and nothing needs to be forced.",
  },
  approach_emphasis: {
    nl: "Jij bepaalt waar je naartoe wilt, ik loop met je mee en hou je vast als het spannend wordt.",
    en: "You decide where you want to go. I walk beside you and support you when it feels vulnerable.",
  },
  approach_note: {
    nl: "Mijn begeleiding is geen vervanging van therapie of medische zorg. Twijfel je of dit bij je past? Dan bespreken we dat gewoon samen.",
    en: "My guidance is not a replacement for therapy or medical care. Unsure whether this is right for you? We can simply discuss that together.",
  },
  approach_cta: {
    nl: "Lees meer over mijn werkwijze",
    en: "Read more about my approach",
  },

  reviews_kicker: { nl: "Ervaringen", en: "Experiences" },
  reviews_title: { nl: "Wat vrouwen zeggen", en: "What women say" },

  about_kicker: { nl: "Over mij", en: "About me" },
  about_title: { nl: "Ik ben Cherelle", en: "I’m Cherelle" },
  about_body_1: {
    nl: "Ik ken dit van binnenuit. Jarenlang deed ik alles goed: harder werken, meer leren, er altijd voor anderen zijn. En toch bleef het van binnen leeg. Op een reis naar Egypte voelde ik voor het eerst hoe het is om gewoon te zijn, vrij en in het moment.",
    en: "I know this from the inside. For years I did everything right: working harder, learning more and always being there for others. Yet inside it still felt empty. During a journey to Egypt I felt for the first time what it is like to simply be, free and present.",
  },
  about_body_2: {
    nl: "Sindsdien begeleid ik vrouwen terug naar zichzelf. Inmiddels zijn dat er zo’n 500, en organiseerde ik ongeveer 15 ceremonies.",
    en: "Since then I have guided women back to themselves. By now that is around 500 women, and I have organised about 15 ceremonies.",
  },
  about_cta: { nl: "Lees mijn verhaal", en: "Read my story" },

  invitation_kicker: { nl: "Uitnodiging", en: "Invitation" },
  invitation_title: {
    nl: "Voel je dat het tijd is?",
    en: "Do you feel it is time?",
  },
  invitation_body: {
    nl: "Plan een vrijblijvend kennismakingsgesprek. We kijken samen waar je nu staat en wat bij je past. Je mag ook gewoon een berichtje sturen.",
    en: "Plan a no-obligation introductory conversation. Together we will look at where you are now and what suits you. You are also welcome to simply send a message.",
  },
};

export const CONTENT_GROUPS = [
  {
    id: "hero",
    title: "Hero",
    fields: ["hero_sentence_1", "hero_sentence_2", "hero_subtitle", "hero_cta"],
  },
  {
    id: "recognition",
    title: "Herkenning",
    fields: ["recognition_kicker", "recognition_title", "recognition_body", "recognition_emphasis", "recognition_cta"],
  },
  {
    id: "homecoming",
    title: "Thuiskomen",
    fields: ["homecoming_kicker", "homecoming_title", "homecoming_body", "homecoming_manifesto", "homecoming_cta"],
  },
  {
    id: "guidance",
    title: "Begeleiding",
    fields: [
      "guidance_kicker", "guidance_title",
      "guidance_1_title", "guidance_1_body", "guidance_1_cta",
      "guidance_2_title", "guidance_2_body", "guidance_2_cta",
      "guidance_3_title", "guidance_3_body", "guidance_3_cta",
    ],
  },
  {
    id: "approach",
    title: "Werkwijze",
    fields: ["approach_kicker", "approach_body", "approach_emphasis", "approach_note", "approach_cta"],
  },
  {
    id: "reviews",
    title: "Ervaringen",
    fields: ["reviews_kicker", "reviews_title"],
  },
  {
    id: "about",
    title: "Over mij",
    fields: ["about_kicker", "about_title", "about_body_1", "about_body_2", "about_cta"],
  },
  {
    id: "invitation",
    title: "Uitnodiging",
    fields: ["invitation_kicker", "invitation_title", "invitation_body"],
  },
] as const;

export const MEDIA_SLOTS = [
  { slot: "hero", label: "Hero", fallback: "/HeroCherelle.webp" },
  { slot: "recognition", label: "Herkenning", fallback: "/Herkenning.jpg" },
  { slot: "homecoming", label: "Thuiskomen", fallback: "/Thuiskomen.jpg" },
  { slot: "guidance_feminine", label: "The Feminine Way", fallback: "/feminine.jpg" },
  { slot: "guidance_1to1", label: "1-op-1 sessie", fallback: "/1-op-1.jpg" },
  { slot: "guidance_ceremonies", label: "Ceremonies", fallback: "/ceremonies.jpg" },
  { slot: "approach", label: "Werkwijze", fallback: "/Werkwijze.png" },
  { slot: "about", label: "Over mij", fallback: "/Overmij.webp" },
  { slot: "invitation", label: "Uitnodiging", fallback: "/Uitnodiging.webp" },
] as const;

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

export function contentValue(content: CmsContentMap, key: string, language: CmsLanguage) {
  return content[key]?.[language] ?? DEFAULT_HOMEPAGE_CONTENT[key]?.[language] ?? "";
}

export async function loadPublicCms() {
  if (!isCmsConfigured) {
    return {
      content: DEFAULT_HOMEPAGE_CONTENT,
      reviews: [] as CmsReview[],
      media: {} as Record<string, CmsMedia>,
    };
  }

  try {
    const [contentResponse, reviewsResponse, mediaResponse] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/cherelle_content?select=key,value_nl,value_en`, {
        headers: { apikey: supabaseKey },
        cache: "no-store",
      }),
      fetch(`${supabaseUrl}/rest/v1/cherelle_reviews?select=*&is_published=eq.true&order=sort_order.asc,created_at.asc`, {
        headers: { apikey: supabaseKey },
        cache: "no-store",
      }),
      fetch(`${supabaseUrl}/rest/v1/cherelle_media?select=*`, {
        headers: { apikey: supabaseKey },
        cache: "no-store",
      }),
    ]);

    if (!contentResponse.ok || !reviewsResponse.ok || !mediaResponse.ok) {
      throw new Error("CMS data kon niet worden geladen.");
    }

    const contentRows = await contentResponse.json() as Array<{ key: string; value_nl: string; value_en: string }>;
    const reviews = await reviewsResponse.json() as CmsReview[];
    const mediaRows = await mediaResponse.json() as CmsMedia[];

    const content: CmsContentMap = { ...DEFAULT_HOMEPAGE_CONTENT };
    for (const row of contentRows) {
      content[row.key] = {
        nl: row.value_nl ?? content[row.key]?.nl ?? "",
        en: row.value_en ?? content[row.key]?.en ?? "",
      };
    }

    const media = Object.fromEntries(mediaRows.map((item) => [item.slot, item])) as Record<string, CmsMedia>;
    return { content, reviews, media };
  } catch {
    return {
      content: DEFAULT_HOMEPAGE_CONTENT,
      reviews: [] as CmsReview[],
      media: {} as Record<string, CmsMedia>,
    };
  }
}

export async function loginCms(email: string, password: string): Promise<CmsSession> {
  if (!isCmsConfigured) throw new Error("Supabase is nog niet gekoppeld.");

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error(await responseError(response));
  const data = await response.json();

  const session: CmsSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + Number(data.expires_in ?? 3600) * 1000,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  };

  const adminResponse = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_admins?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`,
    { headers: headers(session.access_token) }
  );

  if (!adminResponse.ok) throw new Error(await responseError(adminResponse));
  const admins = await adminResponse.json();
  if (!Array.isArray(admins) || admins.length === 0) {
    throw new Error("Dit account heeft geen beheerrechten.");
  }

  window.localStorage.setItem(sessionKey, JSON.stringify(session));
  return session;
}

export function getSavedCmsSession(): CmsSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(sessionKey);
    return raw ? JSON.parse(raw) as CmsSession : null;
  } catch {
    return null;
  }
}

export function clearCmsSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(sessionKey);
}

export async function verifyCmsSession(session: CmsSession) {
  if (!isCmsConfigured) return false;
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_admins?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`,
    { headers: headers(session.access_token) }
  );
  if (!response.ok) return false;
  const data = await response.json();
  return Array.isArray(data) && data.length > 0;
}

export async function loadAdminCms(session: CmsSession) {
  if (!isCmsConfigured) throw new Error("Supabase is nog niet gekoppeld.");

  const [contentResponse, reviewsResponse, mediaResponse] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/cherelle_content?select=*&order=key.asc`, {
      headers: headers(session.access_token),
      cache: "no-store",
    }),
    fetch(`${supabaseUrl}/rest/v1/cherelle_reviews?select=*&order=sort_order.asc,created_at.asc`, {
      headers: headers(session.access_token),
      cache: "no-store",
    }),
    fetch(`${supabaseUrl}/rest/v1/cherelle_media?select=*`, {
      headers: headers(session.access_token),
      cache: "no-store",
    }),
  ]);

  if (!contentResponse.ok) throw new Error(await responseError(contentResponse));
  if (!reviewsResponse.ok) throw new Error(await responseError(reviewsResponse));
  if (!mediaResponse.ok) throw new Error(await responseError(mediaResponse));

  const contentRows = await contentResponse.json() as Array<{ key: string; value_nl: string; value_en: string }>;
  const content: CmsContentMap = { ...DEFAULT_HOMEPAGE_CONTENT };
  for (const row of contentRows) {
    content[row.key] = { nl: row.value_nl ?? "", en: row.value_en ?? "" };
  }

  const reviews = await reviewsResponse.json() as CmsReview[];
  const mediaRows = await mediaResponse.json() as CmsMedia[];
  const media = Object.fromEntries(mediaRows.map((item) => [item.slot, item])) as Record<string, CmsMedia>;

  return { content, reviews, media };
}

export async function saveContentGroup(session: CmsSession, content: CmsContentMap, keys: readonly string[]) {
  const rows = keys.map((key) => ({
    key,
    value_nl: content[key]?.nl ?? "",
    value_en: content[key]?.en ?? "",
    updated_at: new Date().toISOString(),
  }));

  const response = await fetch(`${supabaseUrl}/rest/v1/cherelle_content?on_conflict=key`, {
    method: "POST",
    headers: {
      ...headers(session.access_token),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) throw new Error(await responseError(response));
}

export async function saveReview(
  session: CmsSession,
  review: Omit<CmsReview, "id"> & { id?: string }
) {
  if (review.id) {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/cherelle_reviews?id=eq.${encodeURIComponent(review.id)}`,
      {
        method: "PATCH",
        headers: {
          ...headers(session.access_token),
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          name: review.name,
          role_nl: review.role_nl,
          role_en: review.role_en,
          quote_nl: review.quote_nl,
          quote_en: review.quote_en,
          is_published: review.is_published,
          sort_order: review.sort_order,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    if (!response.ok) throw new Error(await responseError(response));
    return;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/cherelle_reviews`, {
    method: "POST",
    headers: {
      ...headers(session.access_token),
      Prefer: "return=minimal",
    },
    body: JSON.stringify(review),
  });
  if (!response.ok) throw new Error(await responseError(response));
}

export async function deleteReview(session: CmsSession, id: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_reviews?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: headers(session.access_token),
    }
  );
  if (!response.ok) throw new Error(await responseError(response));
}

export async function uploadMedia(
  session: CmsSession,
  slot: string,
  file: File,
  altNl: string,
  altEn: string
) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `${slot}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${extension}`;

  const uploadResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/cherelle-media/${storagePath}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: file,
    }
  );
  if (!uploadResponse.ok) throw new Error(await responseError(uploadResponse));

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/cherelle-media/${storagePath}`;
  const response = await fetch(`${supabaseUrl}/rest/v1/cherelle_media?on_conflict=slot`, {
    method: "POST",
    headers: {
      ...headers(session.access_token),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      slot,
      storage_path: storagePath,
      public_url: publicUrl,
      alt_nl: altNl || null,
      alt_en: altEn || null,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error(await responseError(response));

  return { slot, storage_path: storagePath, public_url: publicUrl, alt_nl: altNl || null, alt_en: altEn || null } as CmsMedia;
}
