'use client'

import ConnectionStatus from "./connectionStatus";
import React, { useEffect, useState } from "react";
import ControlPanel from "./controlPanel";
import Timer from "./timer";

// This component handles the recording navbar for the SmartHub RecorderTab application.
export default function NavbarRecording() {
    const [recordingState, setRecordingState] = useState({
        isRecording: false,
        startTime: null
    });
    const [recordingTime, setRecordingTime] = useState(0);

    // Add timer effect for continuous updates
    useEffect(() => {
        let timerInterval;

        if (recordingState.isRecording && recordingState.startTime) {
            // Update the time every 100ms
            timerInterval = setInterval(() => {
                const elapsedTime = (Date.now() - recordingState.startTime) / 1000;
                setRecordingTime(elapsedTime);
            }, 100);
        }

        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [recordingState.isRecording, recordingState.startTime]);

    // Define event handlers
    const handleRestartRecording = (eventData) => {
        setRecordingTime(0); // Reset time only on restart

        if (eventData && eventData.startTime) {
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

    // Set up and clean up IPC listeners
    useEffect(() => {
        if (!window.electronAPI) return;

        // Register event listeners and store the returned cleanup functions
        const restartListener = window.electronAPI.onRestartRecording(handleRestartRecording);
        const beginListener = window.electronAPI.onBeginReading(handleBeginReading);
        const stopListener = window.electronAPI.onStopReading(handleStopReading);

        // Get initial recording state
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
            <Timer recordingTime={recordingTime} recordingState={recordingState} />
        </div>
    );
}