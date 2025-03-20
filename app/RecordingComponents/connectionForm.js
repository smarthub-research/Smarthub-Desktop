'use client'
import React, { useEffect, useState } from "react";

export default function ConnectionForm({connected, setConnectedToBle}) {
    const [connecting, setConnecting] = useState(false);
    const [device, setDevice] = useState(null)
    const [leftDropdownOpen, setLeftOpen] = useState(false);
    const [devices, setDevices] = useState([]);

    async function connectToBle(event) {
        event.preventDefault();
        setConnecting(true);
        try {
            if (window.electronAPI) {
                await window.electronAPI.connectBle(device, null);
            } else {
                console.warn("Electron API not available");
            }
        } catch (error) {
            console.error("Error connecting:", error);
        } finally {
            setConnectedToBle(true);
            setConnecting(false);
        }
    }

    function openDropdown(target) {
        setLeftOpen(prev => !prev);
    }

    function selectDevice(device) {
        setDevice(device);
        setLeftOpen(false);
    }

    useEffect(() => {
        if (window.electronAPI) {
            if (!connecting) {
                window.electronAPI.searchForDevices();
            }

            window.electronAPI.onDeviceDiscovery((newDevice) => {
                setDevices(prevDevices => {
                    if (!prevDevices.some(dev => dev[0] === newDevice[0])) {
                        return [...prevDevices, newDevice];
                    }
                    return prevDevices;
                });
            });
        }
    }, [connecting]);

    return (
        <form onSubmit={connectToBle} className="flex flex-row items-center gap-8">
            <div>
                <p>Device</p>
                <input
                    type="text"
                    className="border border-white py-2 px-1 rounded-lg text-white w-[20vw]"
                    value={device ? device[0] : ""}
                    onClick={() => openDropdown('left')}
                    readOnly
                />
                {leftDropdownOpen && (
                    <ul className="absolute bg-white border border-gray-300 text-black overflow-x-hidden z-50 w-[20vw] h-[25vh] rounded-b-lg">
                        {devices.map((device, index) => (
                            <li key={index} onClick={() => selectDevice(device)}
                                className="cursor-pointer p-2 hover:bg-gray-200">
                                <p className="font-semibold">{device[0]}</p>
                                <p className="text-xs font-light">{device[1]}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button
                className={`${(connected !== false) ? (`bg-blue-500`) : (`bg-[#999999]`)} 
                px-4 py-2 rounded-xl font-semibold cursor-pointer`}
                type="submit" disabled={connecting}
            >
            {connecting ? "Connecting..." : "Connect"}
            </button>
        </form>
    );
}
