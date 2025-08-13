'use client'

import React, { createContext, useState, useContext } from 'react';

// This context is used to manage the flagging state in the application.
const FlaggingContext = createContext();

// FlaggingProvider component provides the flagging state and functions to manage it.
export function FlaggingProvider({ children }) {
    const [flagging, setFlagging] = useState(false);
    const [width, setWidth] = useState(10);

    // Function to toggle the flagging state or set it to a specific value.
    const handleFlagging = (value) => {
        setFlagging(typeof value === 'boolean' ? value : !flagging);
    };

    return (
        <FlaggingContext.Provider value={{ flagging, handleFlagging, width, setWidth }}>
            {children}
        </FlaggingContext.Provider>
    );
}

// Custom hook to use the FlaggingContext, ensuring it is used within a FlaggingProvider.
export function useFlagging() {
    const context = useContext(FlaggingContext);
    if (context === undefined) {
        throw new Error('useFlagging must be used within a FlaggingProvider');
    }
    return context;
}