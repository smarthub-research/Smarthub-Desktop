import React from "react";
import {FlaggingProvider} from "./context/flaggingContext";
import {TestProvider} from "./context/testContext";

export const metadata = {
    title: 'SmartHub RecorderTab',
    description: 'Recording application for SmartHub sensors',
}

export default function RootLayout({ children }) {
    return (
        <TestProvider>
            <FlaggingProvider>
                {children}
            </FlaggingProvider>
        </TestProvider>
    )
}