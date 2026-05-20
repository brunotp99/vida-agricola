import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const CUSTOMER_ROUTES = ["/account", "/checkout", "/wishlist", "/order-confirmation"];
const ADMIN_ROUTES = ["/admin"];

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");
  const hasSession = !!sessionCookie?.value;
  const path = request.nextUrl.pathname;

  if (ADMIN_ROUTES.some((r) => path.startsWith(r))) {
    if (!hasSession) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url),
      );
    }
  }

  if (CUSTOMER_ROUTES.some((r) => path.startsWith(r))) {
    if (!hasSession) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url),
      );
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
