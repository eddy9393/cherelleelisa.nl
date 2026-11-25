import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";

export const runtime = "nodejs";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  activated_at: string | null;
  privacy_acknowledged_at: string | null;
  terms_acknowledged_at: string | null;
};

type IntakeRow = Record<string, unknown>;

function boolText(value: unknown) {
  if (value === true) return "Ja";
  if (value === false) return "Nee";
  return "-";
}

function experienceText(value: unknown) {
  if (value === "none") return "Geen ervaring";
  if (value === "basic") return "Basiservaring";
  if (value === "advanced") return "Gevorderd";
  return "-";
}

function pdfSafe(value: string) {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF\u20AC]/g, "");
}

function text(value: unknown) {
  const result = pdfSafe(String(value ?? "").trim());
  return result || "-";
}

function dateText(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function wrapText(value: string, font: PDFFont, size: number, maxWidth: number) {
  const words = value.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return ["-"];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const authHeader = request.headers.get("authorization") ?? "";

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Serverconfiguratie ontbreekt." }, { status: 503 });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const commonHeaders = {
    apikey: supabaseKey,
    Authorization: authHeader,
  };

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: commonHeaders,
    cache: "no-store",
  });

  if (!userResponse.ok) {
    return NextResponse.json({ error: "Beheersessie is ongeldig." }, { status: 401 });
  }

  const user = await userResponse.json();

  const adminResponse = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
    { headers: commonHeaders, cache: "no-store" }
  );

  if (!adminResponse.ok || (await adminResponse.json()).length === 0) {
    return NextResponse.json({ error: "Geen beheerrechten." }, { status: 403 });
  }

  const [clientResponse, intakeResponse] = await Promise.all([
    fetch(
      `${supabaseUrl}/rest/v1/cherelle_clients?select=id,name,email,activated_at,privacy_acknowledged_at,terms_acknowledged_at&id=eq.${encodeURIComponent(params.id)}&limit=1`,
      { headers: commonHeaders, cache: "no-store" }
    ),
    fetch(
      `${supabaseUrl}/rest/v1/cherelle_intakes?select=*&client_id=eq.${encodeURIComponent(params.id)}&limit=1`,
      { headers: commonHeaders, cache: "no-store" }
    ),
  ]);

  if (!clientResponse.ok || !intakeResponse.ok) {
    return NextResponse.json({ error: "Klantgegevens konden niet worden geladen." }, { status: 502 });
  }

  const clients = await clientResponse.json() as ClientRow[];
  const intakes = await intakeResponse.json() as IntakeRow[];
  const client = clients[0];
  const intake = intakes[0];

  if (!client) {
    return NextResponse.json({ error: "Klant niet gevonden." }, { status: 404 });
  }

  if (!intake) {
    return NextResponse.json({ error: "Deze klant heeft nog geen intake ingevuld." }, { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const pageSize: [number, number] = [595.28, 841.89];
  const marginX = 58;
  const top = 786;
  const bottom = 58;
  const contentWidth = pageSize[0] - marginX * 2;
  let page = pdf.addPage(pageSize);
  let y = top;

  function newPage() {
    page = pdf.addPage(pageSize);
    y = top;
    page.drawText("CHERELLE ELISA", {
      x: marginX,
      y,
      size: 9,
      font: bold,
      color: rgb(0.29, 0.23, 0.2),
    });
    y -= 28;
  }

  function ensureHeight(height: number) {
    if (y - height < bottom) newPage();
  }

  function drawWrapped(
    value: string,
    options: {
      size?: number;
      font?: PDFFont;
      color?: ReturnType<typeof rgb>;
      lineHeight?: number;
      indent?: number;
      maxWidth?: number;
    } = {}
  ) {
    const size = options.size ?? 10;
    const font = options.font ?? regular;
    const lineHeight = options.lineHeight ?? size * 1.45;
    const indent = options.indent ?? 0;
    const maxWidth = options.maxWidth ?? contentWidth - indent;
    const safeValue = pdfSafe(value);
    const lines = safeValue.split("\n").flatMap((part) => wrapText(part || " ", font, size, maxWidth));

    ensureHeight(lines.length * lineHeight + 4);
    for (const line of lines) {
      page.drawText(line, {
        x: marginX + indent,
        y,
        size,
        font,
        color: options.color ?? rgb(0.25, 0.21, 0.18),
      });
      y -= lineHeight;
    }
  }

  function section(title: string) {
    ensureHeight(54);
    y -= 8;
    page.drawLine({
      start: { x: marginX, y },
      end: { x: marginX + contentWidth, y },
      thickness: 0.6,
      color: rgb(0.86, 0.82, 0.78),
    });
    y -= 24;
    drawWrapped(title, { size: 15, font: serifBold, lineHeight: 20 });
    y -= 6;
  }

  function row(label: string, value: string, detail?: string) {
    ensureHeight(44);
    drawWrapped(label.toUpperCase(), {
      size: 7.5,
      font: bold,
      color: rgb(0.55, 0.47, 0.42),
      lineHeight: 11,
    });
    drawWrapped(value, { size: 10.5, font: regular, lineHeight: 15 });
    if (detail && detail.trim()) {
      drawWrapped(detail.trim(), {
        size: 9.5,
        font: regular,
        color: rgb(0.39, 0.33, 0.29),
        lineHeight: 14,
        indent: 10,
      });
    }
    y -= 9;
  }

  page.drawText("CHERELLE ELISA", {
    x: marginX,
    y,
    size: 10,
    font: bold,
    color: rgb(0.29, 0.23, 0.2),
  });
  y -= 36;
  page.drawText("Intakeformulier", {
    x: marginX,
    y,
    size: 30,
    font: serif,
    color: rgb(0.18, 0.14, 0.12),
  });
  y -= 32;
  drawWrapped(client.name, { size: 17, font: serifBold, lineHeight: 22 });
  drawWrapped(client.email, {
    size: 9.5,
    color: rgb(0.5, 0.43, 0.39),
    lineHeight: 14,
  });
  y -= 10;

  section("Persoonlijke gegevens");
  row("Naam", client.name);
  row("E-mailadres", client.email);
  row("Geboortedatum", dateText(intake.birth_date));
  row("Telefoonnummer", text(intake.phone));

  section("Intentie & ervaring");
  row("Intentie voor de sessie", text(intake.intention));
  row("Ervaring met Kundalini / energiewerk", experienceText(intake.energy_experience_level));
  row(
    "Intense energetische ervaringen",
    boolText(intake.intense_energy_experience),
    text(intake.intense_energy_details) === "-" ? undefined : text(intake.intense_energy_details)
  );

  section("Gezondheid & medische achtergrond");
  row(
    "Fysieke klachten of medische aandoeningen",
    boolText(intake.physical_conditions),
    text(intake.physical_conditions_details) === "-" ? undefined : text(intake.physical_conditions_details)
  );
  row(
    "Medicijnen of supplementen",
    boolText(intake.medications),
    text(intake.medications_details) === "-" ? undefined : text(intake.medications_details)
  );
  row(
    "Meditatie, yoga of ademwerk",
    boolText(intake.meditation_breathwork_experience),
    text(intake.meditation_breathwork_details) === "-" ? undefined : text(intake.meditation_breathwork_details)
  );
  row(
    "Psychische klachten of verleden met trauma",
    boolText(intake.mental_health_or_trauma),
    text(intake.mental_health_or_trauma_details) === "-" ? undefined : text(intake.mental_health_or_trauma_details)
  );
  row(
    "Stimulerende middelen",
    boolText(intake.stimulants),
    text(intake.stimulants_details) === "-" ? undefined : text(intake.stimulants_details)
  );

  section("Juridische bevestigingen");
  row("Privacyverklaring kennisgenomen", client.privacy_acknowledged_at ? "Ja" : "Nee", dateText(client.privacy_acknowledged_at));
  row("Algemene voorwaarden kennisgenomen", client.terms_acknowledged_at ? "Ja" : "Nee", dateText(client.terms_acknowledged_at));
  row("Toestemming verwerking gezondheidsgegevens", boolText(intake.health_data_consent), dateText(intake.health_data_consent_at));

  section("Verklaring & ondertekening");
  row("Contra-indicaties doorgenomen", boolText(intake.contraindications_acknowledged));
  row("Verklaring bevestigd", boolText(intake.declaration_accepted));
  row("Digitale handtekening", text(intake.signature_name));
  row("Datum ondertekening", dateText(intake.signature_date));
  row("Intake verstuurd", dateText(intake.submitted_at));

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="intake.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
