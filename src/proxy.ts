import { type NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: ["/admon/:path*"],
};
