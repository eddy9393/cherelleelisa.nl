import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.1";

const jsonHeaders = { "Content-Type": "application/json" };

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
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
  const user = userData.user;
  if (userError || !user) {
    return respond(401, { error: "Sessie is ongeldig of verlopen." });
  }

  const { data: client, error: clientError } = await service
    .from("cherelle_clients")
    .select("id,user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (clientError || !client) {
    return respond(403, { error: "Er is geen klantaccount aan deze gebruiker gekoppeld." });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (body.action !== "delete") {
    return respond(400, { error: "Ongeldige actie." });
  }

  const { error: deleteError } = await service.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return respond(500, { error: "Account kon niet worden verwijderd." });
  }

  return respond(200, { ok: true });
});
