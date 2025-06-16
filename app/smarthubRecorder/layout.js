import NavbarRecording from "./navbar/navbarRecording";
import React from "react";
import {FlaggingProvider} from "./context/flaggingContext";

export const metadata = {
    title: 'SmartHub RecorderTab',
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