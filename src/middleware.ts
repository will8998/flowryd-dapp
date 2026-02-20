import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/discover',
  '/demo',
  '/onboarding',
  '/media-kit',
  '/documentation',
  '/terms',
  '/privacy',
  '/cookies',
];

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/auth/me',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  const isPublicApiPath = PUBLIC_API_PATHS.some(path => pathname.startsWith(path));

  if (isPublicPath || isPublicApiPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('flowryd-access-token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'flowryd',
    });

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub as string);
    requestHeaders.set('x-user-role', payload['role'] as string);
    requestHeaders.set('x-user-org-id', payload['orgId'] as string);
    requestHeaders.set('x-user-party-id', payload['partyId'] as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp|.*\\.ico).*)',
  ],
};