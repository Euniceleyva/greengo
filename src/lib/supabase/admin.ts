import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serverKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serverKey) {
    throw new Error("Supabase no está configurado para operaciones de servidor.");
  }

  return createClient(url, serverKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
