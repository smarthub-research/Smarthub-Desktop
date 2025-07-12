/**
 * This file creates the necessary middleware for a supabase auth session
 */
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

/**
 * Supabase middleware configuration
 *
 * @param req - auth request
 * @returns {Promise<NextResponse<unknown>>}
 */
export async function middleware(req) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    // If no session (not logged in), redirect to login
    if (!session) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return res;
}

export const config = {
    matcher: [
        '/((?!login|register|api|_next/static|_next/image|favicon.ico).*)',
    ],
};