import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Check for the session cookie
  const session = request.cookies.get('employer_session')?.value;

  // 2. Define protected paths
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard/employer');
  const isLoginPage = request.nextUrl.pathname.startsWith('/auth/employer'); // Check your actual login path

  // Scenario: Not logged in, trying to access dashboard
  if (isDashboard && !session) {
    return NextResponse.redirect(new URL('/auth/employer', request.url));
  }

  // Scenario: Already logged in, trying to access login page
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/dashboard/employer', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/employer'],
};