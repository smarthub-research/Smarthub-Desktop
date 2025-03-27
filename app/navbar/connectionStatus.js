'use client';
import { useEffect, useState } from 'react';
import { BsCheckCircleFill, BsExclamationTriangleFill } from 'react-icons/bs';

export default function ConnectionStatus() {
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

    return (
        <div className="p-4 h-full bg-[#0a0a0a] rounded-xl shadow-md self-start">
            {loading ? (
                <div className="flex items-center space-x-2 py-2">
                    <div className="w-4 h-4 rounded-full bg-gray-700 animate-pulse"></div>
                    <p className="text-gray-400">Connecting to devices...</p>
                </div>
            ) : (
                <div className="flex flex-row gap-4 h-full">
                    {devices.map((device, index) => (
                        <div key={index} className="flex items-center justify-between px-3 py-2 rounded-lg">
                            <div className="flex items-center space-x-3">
                                {device ? (
                                    <BsCheckCircleFill className="text-green-500" />
                                ) : (
                                    <BsExclamationTriangleFill className="text-amber-500" />
                                )}
                                <span className="text-white">
                                    {device ? device.name : `Device ${index + 1} not found`}
                                </span>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                device ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'
                            }`}>
                                {device ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}