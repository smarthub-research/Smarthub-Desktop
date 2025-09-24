import './globals.css'
import { Montserrat } from 'next/font/google'
import NavbarHandler from "./components/navbar/navbarHandler";
import { AuthProvider } from "./auth/authContext";

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '700']
})

export const metadata = {
    title: 'SmartHub Desktop',
    description: 'Recording application for SmartHub sensors',
}

export default function RootLayout({ children }) {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isAuthRoute = pathname.includes('auth');
    return (
        <html lang="en">
            <body className={`${montserrat.className} flex flex-row min-h-screen w-screen max-w-screen overflow-x-hidden font-mono bg-surface-200`}>
                <AuthProvider>
                    <NavbarHandler />
                    <div className={`grow`}>
                        {children}
                    </div>
                </AuthProvider>
            </body>
        </html>
    )
}