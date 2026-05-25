import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('__session')?.value;
  const role = request.cookies.get('ntl_role')?.value || 'recruit';
  
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/onboarding');
                      
  // No session, restrict to login
  if (!sessionToken && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Role-based route protection
  if (request.nextUrl.pathname.startsWith('/war-room')) {
    if (role !== 'board_lead' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Prevent recruits from accessing main dashboard until approved
  if (request.nextUrl.pathname.startsWith('/dashboard') && role === 'recruit') {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
