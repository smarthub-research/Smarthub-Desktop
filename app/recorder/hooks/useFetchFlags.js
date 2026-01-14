'use client'
import { useEffect, useState } from "react";

// Custom hook to fetch and manage flags for graph annotations.
// Props:
// - graphId: Optional string to filter flags by specific graph ID.
// Purpose: Provides real-time flag data for charts, allowing users to mark important points.
// Returns: Array containing [flags array, setFlags function].
export default function useFetchFlags({graphId = null} = {}) {
    const [flags, setFlags] = useState([]);

    useEffect(() => {
        if (window.electronAPI) {
            // Fetch existing flags when component mounts
            const fetchFlags = async () => {
                const response = await window.electronAPI.getFlags();
                if (response && response.flags) {
                    const filteredFlags = graphId
                        ? response.flags.filter(flag => flag.graphId === graphId)
                        : response.flags;
                    setFlags(filteredFlags);
                }
            };

            fetchFlags();

            // Listen for new flags in real-time
            const newFlagHandler = (flag) => {
                setFlags(prev => {
                    // Check if flag already exists to prevent duplicates
                    if (graphId && flag.graphId !== graphId) {
                        return prev;
                    }

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
    }, [graphId]);

    return [flags, setFlags];
}