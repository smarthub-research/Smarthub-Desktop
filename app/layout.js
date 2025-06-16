import './globals.css'
import React from "react";
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '700']
})

export const metadata = {
    title: 'SmartHub RecorderTab',
    description: 'Recording application for SmartHub sensors',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${montserrat.className} overflow-x-hidden font-mono bg-gray-100`}>
                {children}
            </body>
        </html>
    )
}