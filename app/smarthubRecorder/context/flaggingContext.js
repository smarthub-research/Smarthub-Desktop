'use client'

import React, { createContext, useState, useContext } from 'react';

const FlaggingContext = createContext();

export function FlaggingProvider({ children }) {
    const [flagging, setFlagging] = useState(false);
    const [width, setWidth] = useState(20);

    const handleFlagging = (value) => {
        setFlagging(typeof value === 'boolean' ? value : !flagging);
    };

    return (
        <FlaggingContext.Provider value={{ flagging, handleFlagging, width, setWidth }}>
            {children}
        </FlaggingContext.Provider>
    );
}

export function useFlagging() {
    const context = useContext(FlaggingContext);
    if (context === undefined) {
        throw new Error('useFlagging must be used within a FlaggingProvider');
    }
    return context;
}