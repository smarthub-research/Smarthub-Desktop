'use client'
import React, { useEffect, useState } from "react";

const Page = () => {
    const [bleData, setBleData] = useState([]);
    const [connecting, setConnecting] = useState(false);
    const [connectedToBle, setConnectedToBle] = useState(false);

    const [deviceOne, setDeviceOne] = useState("");
    const [deviceTwo, setDeviceTwo] = useState("");

    async function connectToBle(event) {
        event.preventDefault();
        setConnecting(true);

        try {
            if (window.electronAPI) {
                const response = await window.electronAPI.connectBle(deviceOne, deviceTwo);
                console.log("Response from main:", response);
                setConnectedToBle(true);
            } else {
                console.warn("Electron API not available");
            }
        } catch (error) {
            console.error("Error connecting:", error);
        } finally {
            setConnecting(false);
        }
    }

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
        <div>
            <h1>BLE Data</h1>
            <form onSubmit={connectToBle}>
                <input
                    type="text"
                    placeholder="Left Smarthub Name"
                    value={deviceOne}
                    onChange={(e) => setDeviceOne(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Right Smarthub Name"
                    value={deviceTwo}
                    onChange={(e) => setDeviceTwo(e.target.value)}
                />
                <button type="submit" disabled={connecting}>
                    {connecting ? "Connecting..." : "Connect"}
                </button>
            </form>

            {connectedToBle && (
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
    );
};

export default Page;
