import { Inter } from 'next/font/google'
import './globals.css'
import NavbarRecording from "./navbar/navbarRecording";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'SmartHub Recorder',
    description: 'Recording application for SmartHub sensors',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.className} overflow-x-hidden`}>
                <NavbarRecording/>
                {children}
            </body>
        </html>
    )
}