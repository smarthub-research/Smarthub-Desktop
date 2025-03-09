'use client'
import React, { useEffect, useState } from "react";
import ConnectionForm from "./connectionForm";


export default function Recorder() {
    const [bleData, setBleData] = useState([]);
    const [connectedToBle, setConnectedToBle] = useState(false);

    async function beginBleReading() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.beginReadingData();
            }
        } catch (error) {
            console.error("Error starting BLE reading:", error);
        }
    }

    async function stopRecording() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.stopRecordingData();
            }
        } catch (error) {
            console.error("Error stopping recording:", error);
        }
    }

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onBLEData((newData) => {
                setBleData((prevData) => [...prevData, newData]);
            });
        }
    }, []);

    return (
        <div className={'flex flex-col gap-10 items-center'}>
            {!connectedToBle ? (
                <ConnectionForm setConnectedToBle={setConnectedToBle}/>
            ) : (
                <>
                    <button onClick={beginBleReading}>Start</button>
                    <button onClick={stopRecording}>Stop</button>
                    <ul>
                        {bleData.length > 0 ? (
                            bleData.map((data, index) => <li key={index}>{data}</li>)
                        ) : (
                            <p>No data available</p>
                        )}
                    </ul>
                </>
            )}
        </div>
    )
}