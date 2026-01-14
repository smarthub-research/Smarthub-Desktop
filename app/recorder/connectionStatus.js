'use client';
import {useEffect, useState} from 'react';
import {BsCheckCircleFill, BsExclamationTriangleFill} from 'react-icons/bs';

// Component that displays the connection status of two BLE devices.
// Polls for updates and listens for disconnection events.
export default function ConnectionStatus() {
    // State for connection status (boolean for each device)
    const [connectionStatus, setConnectionStatus] = useState({
        deviceOne: false,
        deviceTwo: false
    });
    // Array of device objects from Electron API
    const [devices, setDevices] = useState([null, null]);
    // Loading state while waiting for initial device detection
    const [loading, setLoading] = useState(true);

    // Effect to fetch and poll device list
    useEffect(() => {
        async function fetchDevices() {
            try {
                const result = await window.electronAPI.getConnectedDevices();
                setDevices(result);
                if (result[0] && result[1]) {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching devices:", error);
                setLoading(false);
            }
        }

        fetchDevices();

        // Poll for device status updates every 5 seconds
        const intervalId = setInterval(fetchDevices, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // Effect to check connection status and set up disconnection listeners
    useEffect(() => {
        // Check connection status and update state
        async function checkStatus() {
            try {
                const status = await window.electronAPI.checkConnectionStatus();
                setConnectionStatus(status);

                // If either device is connected, stop loading
                if (status.deviceOne || status.deviceTwo) {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error checking connection status:", error);
                setLoading(false);
            }
        }

        let cleanupFunction = null;

        // Set up disconnection listeners
        async function setupListeners() {
            await window.electronAPI.setupDisconnectionListeners();

            // Register for disconnect events
            cleanupFunction = window.electronAPI.onDeviceDisconnected((data) => {
                const {device} = data;
                setConnectionStatus(prev => ({
                    ...prev,
                    [device === 'one' ? 'deviceOne' : 'deviceTwo']: false
                }));
            });
        }

        // Initial status check
        checkStatus();

        // Set up listeners
        setupListeners();

        // Poll for connection status updates every 5 seconds
        const intervalId = setInterval(checkStatus, 5000);

        return () => {
            clearInterval(intervalId);
            if (cleanupFunction) cleanupFunction();
        };
    }, []);

    return (
        <div className="my-auto rounded-xl hidden md:block">
            {loading ? (
                <div className="flex items-center space-x-2 py-2">
                    <div className="w-4 h-4 rounded-full bg-primary-300 animate-pulse"></div>
                    <p className="text-gray-400">Waiting for devices...</p>
                </div>
            ) : (
                <div className="flex flex-col h-full p-2 rounded-lg text-sm">
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg ">
                        <div className="flex items-center space-x-3">
                            {connectionStatus.deviceOne ? (
                                <BsCheckCircleFill className="text-green-500" />
                            ) : (
                                <BsExclamationTriangleFill className="text-amber-500" />
                            )}
                            <span>
                                {devices[0] ? devices[0].name : `Device 1 not found`}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-3">
                            {connectionStatus.deviceTwo ? (
                                <BsCheckCircleFill className="text-green-500" />
                            ) : (
                                <BsExclamationTriangleFill className="text-amber-500" />
                            )}
                            <span>
                                {devices[1] ? devices[1].name : `Device 2 not found`}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
