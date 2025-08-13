import { useState, useEffect } from "react";
import StopButton from "./stopButton";
import RestartButton from "./restartButton";
import FlaggingButton from "./flaggingButton";
import StartButton from "./startButton";

// Component for the control panel with buttons to start, stop, and restart recording,
export default function ControlPanel() {
    const [recording, setRecording] = useState(false);
    const [enabled, setEnabled] = useState(false);

    // Set up and clean up IPC listeners
    useEffect(() => {
        if (!window.electronAPI) return;

        // Define event handlers
        const handleBeginReading = () => {
            setRecording(true);
        };

        // Stop reading data
        const handleStopReading = () => {
            setRecording(false);
        };

        // Register event listeners
        window.electronAPI.onBeginReading(handleBeginReading);
        window.electronAPI.onStopReading(handleStopReading);

        // Clean up function to remove listeners when component unmounts
        return () => {
            if (window.electronAPI) {
                window.electronAPI.removeListener('begin-reading', handleBeginReading);
                window.electronAPI.removeListener('stop-reading', handleStopReading);
            }
        };
    }, []);

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
            <FlaggingButton enabled={enabled} />
        </div>
    );
}