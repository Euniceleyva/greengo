import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";

/**
 * The operational demo remains in the repository, but is not part of the
 * public product while this flag is disabled. Set INTERNAL_SYSTEM_ENABLED=true
 * in the deployment environment when the admin and driver experiences should
 * be available again.
 */
export async function proxy(request: NextRequest) {
  const isHiddenInternalRoute = ["/admin", "/driver", "/demo"].some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`),
  );

  if (isHiddenInternalRoute && process.env.INTERNAL_SYSTEM_ENABLED !== "true") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admon")) {
    return refreshSupabaseSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/driver/:path*", "/demo/:path*", "/admon/:path*"],
};
