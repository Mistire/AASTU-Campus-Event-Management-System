import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files, API routes, and images
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('favicon.ico') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Check for the auth cookie created by zustand persist
    const authCookie = request.cookies.get('auth-storage')?.value;

    let hasSession = false;
    if (authCookie) {
        try {
            const decoded = decodeURIComponent(authCookie);
            const parsed = JSON.parse(decoded);
            if (parsed?.state?.token || parsed?.state?.refreshToken) {
                hasSession = true;
            }
        } catch {
            console.error('Middleware: Error parsing auth cookie');
        }
    }

    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/signup';
    const isHomePage = pathname === '/';
    const isStudentRoute = pathname.startsWith('/discovery');
    const isDashboardRoute = pathname.startsWith('/dashboard');

    let userRole = '';
    if (authCookie) {
        try {
            const decoded = decodeURIComponent(authCookie);
            const parsed = JSON.parse(decoded);
            userRole = parsed?.state?.profile?.role || '';
        } catch {
            console.error('Middleware: Error parsing role');
        }
    }

    // Role-based Home Redirect (for logged in users hitting login or root)
    if (hasSession && (isAuthPage || isHomePage)) {
        if (userRole === 'STUDENT') {
            return NextResponse.redirect(new URL('/discovery', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Protect Dashboard: Only allow ADMIN/ORGANIZER/STAFF
    if (isDashboardRoute) {
        if (!hasSession) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (userRole === 'STUDENT') {
            return NextResponse.redirect(new URL('/discovery', request.url));
        }
    }

    // Protect Student Home: Anyone but unauthenticated users
    if (isStudentRoute && !hasSession) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
