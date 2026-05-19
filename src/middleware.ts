import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/dashboard")) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!isValidAdminSession(session)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // API admin routes (except login) are protected in route handlers; add defense-in-depth
  if (
    pathname.startsWith("/api/admin/") &&
    !pathname.startsWith("/api/admin/login") &&
    !pathname.startsWith("/api/admin/logout")
  ) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!isValidAdminSession(session)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/admin/:path*"],
};
