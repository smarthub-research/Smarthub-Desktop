import './globals.css'
import React from "react";
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '700']
})

export const metadata = {
    title: 'SmartHub Recorder',
    description: 'Recording application for SmartHub sensors',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${montserrat.className} overflow-x-hidden font-mono`}>
                {children}
            </body>
        </html>
    )
}