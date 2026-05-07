import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  const protectedRoutes = ['/profile', '/settings', '/upload', '/admin', '/activity'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If trying to access protected routes, require authentication
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token expiration for protected routes only
  if (isProtectedRoute && token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error("Invalid token format");
      
      const payloadBase64 = parts[1];
      const payloadString = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadString);
      
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error("Token expired");
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Allow navigation to auth routes even if token exists
  // (user can visit login/register, but the page handles redirects if already logged in)
  if (isAuthRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
