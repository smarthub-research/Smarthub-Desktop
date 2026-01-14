/**
 * NavbarHandler Component
 * Conditionally renders the navbar based on the current pathname.
 * Hides the navbar on authentication pages (login, register, auth routes).
 */
'use client'
// app/components/NavbarHandler.js
import { usePathname } from 'next/navigation';
import Navbar from './page';

export default function NavbarHandler() {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/register';

    return isAuthPage ? null : <Navbar />;
}