import { useState, useEffect } from "react";
import StopButton from "./stopButton";
import RestartButton from "./restartButton";
import FlaggingButton from "./flaggingButton";
import StartButton from "./startButton";

// Component for the control panel with buttons to start, stop, and restart recording,
export default function ControlPanel() {
    const [recording, setRecording] = useState(false);

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

    return (
        <div className="flex flex-row h-full gap-3 px-4 items-center justify-center rounded-xl">
            <StartButton recording={recording}/>
            <StopButton recording={recording}/>
            <RestartButton/>
            <FlaggingButton/>
        </div>
    );
}