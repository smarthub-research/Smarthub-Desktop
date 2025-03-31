import { Inter } from 'next/font/google'
import NavbarRecording from "./navbar/navbarRecording";
import React from "react";
import {FlaggingProvider} from "./context/flaggingContext";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'SmartHub Recorder',
    description: 'Recording application for SmartHub sensors',
}

export default function RootLayout({ children }) {
    return (
        <FlaggingProvider>
            <NavbarRecording/>
            {children}
        </FlaggingProvider>
    )
}