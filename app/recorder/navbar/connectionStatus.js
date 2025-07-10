'use client';
import {useEffect, useState} from 'react';
import {BsCheckCircleFill, BsExclamationTriangleFill} from 'react-icons/bs';

export default function ConnectionStatus() {
    const [connectionStatus, setConnectionStatus] = useState({
        deviceOne: false,
        deviceTwo: false
    });
    const [devices, setDevices] = useState([null, null]);
    const [loading, setLoading] = useState(true);

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
        <div className="my-auto rounded-xl ">
            {loading ? (
                <div className="flex items-center space-x-2 py-2">
                    <div className="w-4 h-4 rounded-full bg-gray-700 animate-pulse"></div>
                    <p className="text-gray-400">Connecting to devices...</p>
                </div>
            ) : (
                <div className="flex flex-row h-full bg-surface-300 p-2 rounded-lg">
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg">
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
                        <span className={`text-xs font-medium px-1 rounded ${
                            connectionStatus.deviceOne ?  'bg-green-500' : 'bg-amber-500'
                        }`}>
                            {connectionStatus.deviceOne ? 'Connected' : 'Disconnected'}
                        </span>
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
                        <span className={`text-xs font-medium px-1 rounded ${
                            connectionStatus.deviceTwo ?  'bg-green-500' : 'bg-amber-500'
                        }`}>
                            {connectionStatus.deviceTwo ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}