'use client'

import ConnectionStatus from "./connectionStatus";
import React, { useEffect, useState } from "react";
import ControlPanel from "./controlPanel";
import Timer from "./timer";

// Main navbar component for the recording interface.
// Purpose: Displays connection status, control buttons, and recording timer in a sticky header.
// Manages recording state and time tracking through IPC event listeners.
export default function NavbarRecording() {
    // State for tracking recording status and start time
    const [recordingState, setRecordingState] = useState({
        isRecording: false,
        startTime: null
    });
    // State for the current recording time in seconds
    const [recordingTime, setRecordingTime] = useState(0);

    // Add timer effect for continuous updates during recording
    useEffect(() => {
        let timerInterval;

        if (recordingState.isRecording && recordingState.startTime) {
            // Update the time every 100ms for smooth display
            timerInterval = setInterval(() => {
                const elapsedTime = (Date.now() - recordingState.startTime) / 1000;
                setRecordingTime(elapsedTime);
            }, 100);
        }

        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [recordingState.isRecording, recordingState.startTime]);

    // Define event handlers for recording state changes
    const handleRestartRecording = (eventData) => {
        setRecordingTime(0); // Reset time only on restart

        if (eventData && eventData.startTime) {
            // If startTime is provided, start recording
            setRecordingState({
                isRecording: true,
                startTime: eventData.startTime
            });
        }
    };

    // Handle the beginning of a reading session
    const handleBeginReading = (eventData) => {
        if (eventData && eventData.startTime) {
            setRecordingState({
                isRecording: true,
                startTime: eventData.startTime
            });
        }
    };

    // Handle stopping the reading session
    const handleStopReading = () => {
        // Keep the final time when stopped
        setRecordingState({
            isRecording: false,
            startTime: null
        });
    };

    // Set up and clean up IPC listeners for recording events
    useEffect(() => {
        if (!window.electronAPI) return;

        // Register event listeners and store the returned cleanup functions
        const restartListener = window.electronAPI.onRestartRecording(handleRestartRecording);
        const beginListener = window.electronAPI.onBeginReading(handleBeginReading);
        const stopListener = window.electronAPI.onStopReading(handleStopReading);

        // Get initial recording state from backend
        const initRecordingState = async () => {
            if (window.electronAPI.getRecordingState) {
                const state = await window.electronAPI.getRecordingState();
                setRecordingState(state);
            }
        };

        initRecordingState();

        // Clean up function to remove listeners when component unmounts
        return () => {
            if (window.electronAPI) {
                // Use the returned cleanup functions from the listeners
                restartListener && restartListener();
                beginListener && beginListener();
                stopListener && stopListener();
            }
        };
    }, []);

    return (
        <div className={`sticky z-10 bg-linear-to-b from-surface-200 to-transparent flex flex-row grow justify-center items-center p-4 gap-6 top-0 w-full h-[10dvh] transition`}>
            <ConnectionStatus/>
            <ControlPanel/>
            <Timer recordingTime= {recordingTime} recordingState={recordingState} />
        </div>
    );
}