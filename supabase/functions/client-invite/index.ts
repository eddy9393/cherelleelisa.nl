import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.1";

const jsonHeaders = { "Content-Type": "application/json" };

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return respond(405, { error: "Method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return respond(500, { error: "Serverconfiguratie ontbreekt." });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return respond(401, { error: "Niet ingelogd." });
  }

  const accessToken = authHeader.slice("Bearer ".length).trim();
  const service = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data: userData, error: userError } = await service.auth.getUser(accessToken);
  const adminUser = userData.user;
  if (userError || !adminUser) {
    return respond(401, { error: "Beheersessie is ongeldig of verlopen." });
  }

  const { data: adminMembership, error: adminError } = await service
    .from("cherelle_admins")
    .select("user_id")
    .eq("user_id", adminUser.id)
    .maybeSingle();

  if (adminError || !adminMembership) {
    return respond(403, { error: "Dit account heeft geen beheerrechten." });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return respond(400, { error: "Ongeldige aanvraag." });
  }

  const action = body.action === "resend" ? "resend" : "invite";
  const firstName = String(body.first_name ?? "").trim().slice(0, 80);
  const lastName = String(body.last_name ?? "").trim().slice(0, 100);
  const name = [firstName, lastName].filter(Boolean).join(" ").slice(0, 160);
  const phone = String(body.phone ?? "").trim().slice(0, 60);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);

  if (!validEmail(email)) {
    return respond(400, { error: "Vul een geldig e-mailadres in." });
  }

  if (action === "invite" && (!firstName || !lastName)) {
    return respond(400, { error: "Vul de voornaam en achternaam van de klant in." });
  }

  const { data: existingClient, error: lookupError } = await service
    .from("cherelle_clients")
    .select("id,user_id,name,email,status,invited_at,activated_at,created_at")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    return respond(500, { error: "Klantcontrole is mislukt." });
  }

  if (action === "invite" && existingClient) {
    return respond(409, { error: "Voor dit e-mailadres bestaat al een klantaccount." });
  }

  if (action === "resend") {
    if (!existingClient) {
      return respond(404, { error: "Klantaccount niet gevonden." });
    }
    if (existingClient.activated_at) {
      return respond(409, { error: "Dit klantaccount is al geactiveerd." });
    }
  }

  const linkParams =
    action === "invite"
      ? { type: "invite" as const, email, data: { full_name: name, first_name: firstName, last_name: lastName } }
      : { type: "magiclink" as const, email };

  const { data: linkData, error: linkError } =
    await service.auth.admin.generateLink(linkParams);

  if (linkError || !linkData?.properties?.hashed_token || !linkData.user?.id) {
    return respond(400, {
      error: linkError?.message || "Uitnodigingslink kon niet worden aangemaakt.",
    });
  }

  let client = existingClient;

  if (action === "invite") {
    const { data: inserted, error: insertError } = await service
      .from("cherelle_clients")
      .insert({
        user_id: linkData.user.id,
        name,
        email,
        status: "invited",
        invited_at: new Date().toISOString(),
        created_by: adminUser.id,
      })
      .select("id,user_id,name,email,status,invited_at,activated_at,created_at")
      .single();

    if (insertError || !inserted) {
      await service.auth.admin.deleteUser(linkData.user.id);
      return respond(500, {
        error: insertError?.message || "Klantaccount kon niet worden gekoppeld.",
      });
    }
    if (phone) {
      const { error: intakeError } = await service
        .from("cherelle_intakes")
        .upsert({
          client_id: inserted.id,
          phone,
          updated_at: new Date().toISOString(),
        }, { onConflict: "client_id" });

      if (intakeError) {
        await service.from("cherelle_clients").delete().eq("id", inserted.id);
        await service.auth.admin.deleteUser(linkData.user.id);
        return respond(500, {
          error: "Klantaccount kon niet volledig worden gekoppeld.",
        });
      }
    }

    client = inserted;
  } else {
    await service
      .from("cherelle_clients")
      .update({
        invited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingClient!.id);
  }

  return respond(200, {
    ok: true,
    client,
    token_hash: linkData.properties.hashed_token,
    type: linkData.properties.verification_type || (action === "invite" ? "invite" : "magiclink"),
  });
});
