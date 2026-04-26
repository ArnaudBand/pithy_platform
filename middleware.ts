import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require a valid JWT token cookie
const PROTECTED_PREFIXES = ['/human-services/dashboard', '/human-services/profile', '/human-services/admin'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !token) {
    const signInUrl = new URL('/human-services/signIn', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/human-services/dashboard/:path*', '/human-services/profile/:path*', '/human-services/admin/:path*'],
};