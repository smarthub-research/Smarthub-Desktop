import './globals.css'
import { Montserrat } from 'next/font/google'
import NavbarHandler from "./components/navbar/navbarHandler";

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '700']
})

export const metadata = {
    title: 'SmartHub Desktop',
    description: 'Recording application for SmartHub sensors',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${montserrat.className} flex flex-row h-screen max-h-screen w-screen max-w-screen overflow-x-hidden font-mono bg-surface-200`}>
                <NavbarHandler />
                {children}
            </body>
        </html>
    )
}