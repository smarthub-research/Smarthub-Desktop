'use client'
import React, { useEffect, useState } from "react";
import DemoChart from "./demoChart";
import CalculatedData from "./calculatedData";

export default function Page() {
    const [bleData, setBleData] = useState([]);
    const [recordingState, setRecordingState] = useState({
        isRecording: false,
        startTime: null
    });
    const [recordingTime, setRecordingTime] = useState(0);

    useEffect(() => {
        if (window.electronAPI) {
            // Get initial recording state
            const initRecordingState = async () => {
                const state = await window.electronAPI.getRecordingState();
                setRecordingState(state);
            };

            initRecordingState();

            // Listen for new BLE data
            window.electronAPI.onBLEData((newData) => {
                setBleData((prevData) => [...prevData, newData]);
            });

            // Add restart listener
            window.electronAPI.onRestartRecording((eventData) => {
                console.log("Resetting recording data", eventData);
                setBleData([]); // Reset the bleData array

                if (eventData && eventData.startTime) {
                    setRecordingState({
                        isRecording: true,
                        startTime: eventData.startTime
                    });
                }
            });
        }
    }, []);

    // Timer effect
    useEffect(() => {
        let interval;
        if (recordingState.isRecording && recordingState.startTime) {
            interval = setInterval(() => {
                setRecordingTime((Date.now() - recordingState.startTime) / 1000);
            }, 100);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [recordingState]);

    return (
        <div className={'flex flex-col gap-10 items-center py-12 px-4 overflow-x-hidden'}>

            {/* Charts */}
            <DemoChart data={bleData} title={'Displacement vs Time'}/>
            <DemoChart data={bleData} title={'Heading vs Time'}/>
            <DemoChart data={bleData} title={'Velocity vs Time'}/>

            {/* Optional: Show calculated data */}
            {bleData.length > 0 && <CalculatedData data={bleData}/>}
        </div>
    );
}