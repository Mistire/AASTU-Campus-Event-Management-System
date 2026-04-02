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

    let hasToken = false;
    if (authCookie) {
        try {
            // js-cookie might URI encode the cookie, and zustand stores it as JSON
            const decoded = decodeURIComponent(authCookie);
            const parsed = JSON.parse(decoded);
            if (parsed?.state?.token) {
                hasToken = true;
            }
        } catch (e) {
            // Valid JSON or syntax error handling
            console.error('Middleware: Error parsing auth cookie');
        }
    }

    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/signup';
    const isHomePage = pathname === '/';

    // If user is logged in, restrict access to auth pages and home, force them to dashboard
    if (hasToken && (isAuthPage || isHomePage)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is NOT logged in and tries to access dashboard, send them to login
    if (!hasToken && pathname.startsWith('/dashboard')) {
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
