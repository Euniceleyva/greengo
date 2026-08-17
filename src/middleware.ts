import { NextResponse, type NextRequest } from "next/server";

/**
 * The operational demo remains in the repository, but is not part of the
 * public product while this flag is disabled. Set INTERNAL_SYSTEM_ENABLED=true
 * in the deployment environment when the admin and driver experiences should
 * be available again.
 */
export function middleware(request: NextRequest) {
  if (process.env.INTERNAL_SYSTEM_ENABLED === "true") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/driver/:path*", "/demo/:path*"],
};
