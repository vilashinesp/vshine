import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/orders", "/booking", "/tailor", "/admin", "/chat", "/settings", "/profile"];
const ROLE_PREFIXES: Record<string, string> = {
  "/admin": "admin",
  "/tailor": "tailor",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = request.cookies.get("user_role")?.value;
  for (const [prefix, requiredRole] of Object.entries(ROLE_PREFIXES)) {
    if (pathname.startsWith(prefix) && role !== requiredRole) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/orders/:path*", "/booking/:path*", "/tailor/:path*", "/admin/:path*", "/chat/:path*", "/settings/:path*", "/profile/:path*"],
};
