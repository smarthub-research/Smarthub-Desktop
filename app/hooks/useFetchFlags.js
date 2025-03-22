// app/hooks/useFetchFlags.js
import { useEffect, useState } from "react";

export default function useFetchFlags() {
    const [flags, setFlags] = useState([]);

    useEffect(() => {
        if (window.electronAPI) {
            // Fetch existing flags when component mounts
            const fetchFlags = async () => {
                const response = await window.electronAPI.getFlags();
                if (response && response.flags) {
                    setFlags(response.flags);
                }
            };

            fetchFlags();

            // Listen for new flags
            const newFlagHandler = (flag) => {
                setFlags(prev => {
                    // Check if flag already exists to prevent duplicates
                    if (!prev.some(f => f.id === flag.id)) {
                        return [...prev, flag];
                    }
                    return prev;
                });
            };

            window.electronAPI.onNewFlag(newFlagHandler);

            // Clean up event listener
            return () => {
                // Remove event listener if API supports it
                if (window.electronAPI.removeListener) {
                    window.electronAPI.removeListener('new-flag', newFlagHandler);
                }
            };
        }
    }, []);

    return [flags, setFlags];
}