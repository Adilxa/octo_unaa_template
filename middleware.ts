import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  const path = req.nextUrl.pathname;

  console.log('Middleware check - path:', path, 'token exists:', !!token);

  // If user tries to access protected routes without a token
  if (!token && path.startsWith('/dashboard')) {
    console.log('Redirecting to auth - no token found');
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // If user is on auth page but already has a token
  if (token && path === '/auth') {
    console.log('Redirecting to dashboard - token found');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If user is on the root path, redirect based on auth status
  if (path === '/') {
    if (token) {
      console.log('Redirecting root to dashboard - token found');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      console.log('Redirecting root to auth - no token found');
      return NextResponse.redirect(new URL('/auth', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/auth', '/dashboard/:path*'],
};
