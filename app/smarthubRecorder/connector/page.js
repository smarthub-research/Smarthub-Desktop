'use client'
import {useEffect, useState} from "react";
import Device from "./device";
import useFetchDevices from "./../hooks/useFetchDevices";
import Link from "next/link";

// This component allows users to connect two devices for recording purposes.
export default function Connector() {
    const [deviceOne, setDeviceOne] = useState(null);
    const [deviceTwo, setDeviceTwo] = useState(null);
    const { devices } = useFetchDevices();

    // Function to handle connecting a device
    function handleConnect(device) {
        if (!deviceOne) {
            setDeviceOne(device);
        } else if (!deviceTwo) {
            setDeviceTwo(device);
        } else {
            console.warn("Cannot connect more than two devices.");
        }
    }

    // Function to handle disconnecting a device
    function handleDisconnect(device) {
        if (deviceOne && deviceOne.name === device.name) {
            setDeviceOne(null);
        } else if (deviceTwo && deviceTwo.name === device.name) {
            setDeviceTwo(null);
        }
    }

    // Fetch connected devices when the component mounts
    useEffect(() => {
        async function fetchConnectedDevices() {
            if (window.electronAPI) {
                const connectedDevices = await window.electronAPI.getConnectedDevices();
                if (connectedDevices[0]) {
                    setDeviceOne(connectedDevices[0]);
                }

                if (connectedDevices[1]) {
                    setDeviceTwo(connectedDevices[1]);
                }
            }
        }
        fetchConnectedDevices();
    }, []);

    return (
        <div className="flex flex-col w-full max-h-[90vh] px-4 md:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide text-center">
                Connect Devices
            </h1>

            <div className="flex flex-col w-full max-w-5xl mx-auto gap-6 md:gap-8 lg:gap-10">
                {/* Connected Devices Section */}
                <div className="w-full ">
                    <p className="text-lg md:text-xl font-bold mb-3">Connected</p>
                    <div className="flex flex-col bg-[#0a0a0a] p-3 md:p-4 rounded-lg w-full drop-shadow-md h-[15vh] grow justify-center">
                        <div>
                            {deviceOne ? (
                                <Device
                                    device={deviceOne}
                                    status={'connected'}
                                    onDisconnect={handleDisconnect}
                                />
                            ) : (
                                <h2 className="font-bold text-gray-400">No Connected Device</h2>
                            )}
                        </div>
                        <hr className="border-gray-800 my-2 md:my-3" />
                        <div className="pt-3 md:pt-4">
                            {deviceTwo ? (
                                <Device
                                    device={deviceTwo}
                                    status={'connected'}
                                    onDisconnect={handleDisconnect}
                                />
                            ) : (
                                <h2 className="font-bold text-gray-400">No Connected Device</h2>
                            )}
                        </div>
                    </div>
                </div>

                {/* Nearby Devices Section */}
                <div className="w-full flex-grow">
                    <p className="text-lg md:text-xl font-bold mb-3">Nearby</p>
                    <div className="bg-[#0a0a0a] p-3 md:p-4 rounded-lg w-full h-[35vh] md:h-[40vh] overflow-y-auto
                    drop-shadow-md">
                        {devices.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">Searching for devices...</p>
                        ) : (
                            // Only display devices that are not already connected
                            devices
                                .filter(device =>
                                    (!deviceOne || device.name !== deviceOne.name) &&
                                    (!deviceTwo || device.name !== deviceTwo.name)
                                )
                                .map((device) => {
                                    const canConnect = !deviceOne || !deviceTwo;
                                    return (
                                        <div key={device.name} className="mb-3 last:mb-0">
                                            <Device
                                                device={device}
                                                status={canConnect ? "notConnected" : "cannotConnect"}
                                                onConnect={canConnect ? handleConnect : null}
                                            />
                                            {/* Only add divider if not the last item */}
                                            <hr className="border-gray-800 mt-3" />
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-center mt-8 md:mt-10">
                {/* Next button */}
                <Link
                    href="/smarthubRecorder/recorder/"
                    className={` hover:bg-blue-500 px-6 py-3 rounded-lg font-medium transition-all duration-200
                    ${(deviceOne && deviceTwo) ? 'bg-blue-600 opacity-100 cursor-pointer' :
                        'bg-gray-600 opacity-50 pointer-events-none'}`}>
                    Continue to Recording
                </Link>
            </div>
        </div>
    );
}