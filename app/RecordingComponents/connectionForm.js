'use client'
import React, { useEffect, useState } from "react";

export default function ConnectionForm({ setConnectedToBle }) {
    const [connecting, setConnecting] = useState(false);
    const [deviceOne, setDeviceOne] = useState(null);
    const [deviceTwo, setDeviceTwo] = useState(null);
    const [leftDropdownOpen, setLeftOpen] = useState(false);
    const [rightDropdownOpen, setRightOpen] = useState(false);
    const [devices, setDevices] = useState([]);

    async function connectToBle(event) {
        event.preventDefault();
        setConnecting(true);
        try {
            if (window.electronAPI) {
                await window.electronAPI.connectBle(deviceOne, deviceTwo);
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

    function openDropdown(target) {
        if (target === 'left') {
            setLeftOpen(prev => !prev);
            setRightOpen(false);
        } else {
            setRightOpen(prev => !prev);
            setLeftOpen(false);
        }
    }

    function selectDevice(target, device) {
        if (target === 'left') {
            setDeviceOne(device);
            setLeftOpen(false);
        } else {
            setDeviceTwo(device);
            setRightOpen(false);
        }
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
            <div className="relative">
                <p>Left Smarthub</p>
                <input
                    type="text"
                    className="border border-white py-2 px-1 rounded-lg text-white w-[20vw]"
                    value={deviceOne ? deviceOne[0] : ""}
                    onClick={() => openDropdown('left')}
                    readOnly
                />
                {leftDropdownOpen && (
                    <ul className="absolute bg-white border border-gray-300 text-black overflow-x-hidden z-50 w-[20vw] h-[25vh] rounded-b-lg">
                        {devices.map((device, index) => (
                            ((deviceTwo && deviceTwo[0]) !== device[0]) && (
                                <li key={index} onClick={() => selectDevice('left', device)} className="cursor-pointer p-2 hover:bg-gray-200">
                                    <p className="font-semibold">{device[0]}</p>
                                    <p className="text-xs font-light">{device[1]}</p>
                                </li>
                            )
                        ))}
                    </ul>
                )}
            </div>

            <div className="relative">
                <p>Right Smarthub</p>
                <input
                    type="text"
                    className="border border-white py-2 px-1 rounded-lg text-white w-[20vw]"
                    value={deviceTwo ? deviceTwo[0] : ""}
                    onClick={() => openDropdown('right')}
                    readOnly
                />
                {rightDropdownOpen && (
                    <ul className="absolute bg-white border border-gray-300 text-black overflow-x-hidden z-50 w-[20vw] h-[25vh] rounded-b-lg">
                        {devices.map((device, index) => (
                            ((deviceOne && deviceOne[0]) !== device[0]) && (
                                <li key={index} onClick={() => selectDevice('right', device)} className="cursor-pointer p-2 hover:bg-gray-200">
                                    <p className="font-semibold">{device[0]}</p>
                                    <p className="text-xs font-light">{device[1]}</p>
                                </li>
                            )
                        ))}
                    </ul>
                )}
            </div>


            <button
                className={`${(deviceOne !== null && deviceTwo !== null) ? (`bg-blue-500`) : (`bg-[#999999]`)} 
                px-6 py-4 rounded-xl font-semibold cursor-pointer`}
                type="submit" disabled={connecting}
            >
                {connecting ? "Connecting..." : "Connect"}
            </button>
        </form>
    );
}
