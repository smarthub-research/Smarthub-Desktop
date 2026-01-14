import { useState, useEffect } from "react";
import StopButton from "./stopButton";
import RestartButton from "./restartButton";
import StartButton from "./startButton";
import { useTest } from "../context/testContext";

// Component for the control panel containing start, stop, and restart recording buttons.
// Purpose: Provides the main recording controls in the navbar, enabled only when devices are connected.
// Integrates with TestContext for state management and Electron API for IPC communication.
export default function ControlPanel() {
    // Local state for recording status (mirrors context but used for UI logic)
    const [recording, setRecording] = useState(false);
    // State to enable/disable controls based on device connection
    const [enabled, setEnabled] = useState(false);
    // Get recording handlers from TestContext
    const { handleStartRecording, handleStopRecording, handleRestartRecording } = useTest();

    // Set up and clean up IPC listeners for recording events
    useEffect(() => {
        if (!window.electronAPI) return;

        // Define event handlers
        const handleBeginReading = () => {
            setRecording(true);
            handleStartRecording();
        };

        // Stop reading data
        const handleStopReading = () => {
            setRecording(false);
            handleStopRecording();
        };
        
        // Handle restart recording
        const handleRestart = () => {
            handleRestartRecording();
        };

        // Register event listeners
        window.electronAPI.onBeginReading(handleBeginReading);
        window.electronAPI.onStopReading(handleStopReading);
        const restartCleanup = window.electronAPI.onRestartRecording(handleRestart);

        // Clean up function to remove listeners when component unmounts
        return () => {
            if (window.electronAPI) {
                window.electronAPI.removeListener('begin-reading', handleBeginReading);
                window.electronAPI.removeListener('stop-reading', handleStopReading);
                if (restartCleanup) restartCleanup();
            }
        };
    }, [handleStartRecording, handleStopRecording, handleRestartRecording]);

    // Effect to check device connection and enable controls
    useEffect(() => {
        async function fetchDevices() {
            try {
                const result = await window.electronAPI.getConnectedDevices();
                if (result[0] && result[1]) {
                    setEnabled(true);
                }
            } catch (error) {
                console.error("Error fetching devices:", error);
            }
        }
        fetchDevices();
    }, []);

    return (
        <div className="flex flex-row h-full gap-3 px-4 items-center justify-center rounded-xl">
            <StartButton enabled={enabled} recording={recording}/>
            <StopButton enabled={enabled} recording={recording}/>
            <RestartButton enabled={enabled} />
            {/*<FlaggingButton enabled={enabled} />*/}
        </div>
    );
}