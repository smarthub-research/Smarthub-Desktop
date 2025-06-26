'use client'
import Link from "next/link";
import ConnectedDevices from "./connectedDevices";
import NearbyDevices from "./nearbyDevices";
import useFetchDevices from "../hooks/useFetchDevices";

// This component allows users to connect two devices for recording purposes.
export default function Connector() {
    const { devices, deviceOne, deviceTwo, setDeviceOne, setDeviceTwo } = useFetchDevices()
    return (
        <div className="flex flex-col justify-around w-full h-screen px-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide text-center">
                Connect Devices
            </h1>
            <div className="flex flex-col w-full max-w-5xl mx-auto gap-6 md:gap-8 lg:gap-10">
                {/* Connected Devices Section */}
                <ConnectedDevices
                    deviceOne={deviceOne}
                    deviceTwo={deviceTwo}
                    setDeviceOne={setDeviceOne}
                    setDeviceTwo={setDeviceTwo}
                />
                {/* Nearby Devices Section */}
                <NearbyDevices
                    devices={devices}
                    deviceOne={deviceOne}
                    deviceTwo={deviceTwo}
                    setDeviceOne={setDeviceOne}
                    setDeviceTwo={setDeviceTwo}
                />
            </div>
            {/* Continue Button */}
            <div className="flex justify-center mt-8 md:mt-10">
                {/* Next button */}
                <Link
                    href="/recorder/recorder/"
                    className={` hover:bg-blue-500 px-6 py-3 rounded-lg font-medium transition-all duration-200
                    ${(deviceOne && deviceTwo) ? 'bg-blue-600 opacity-100 cursor-pointer' :
                        'bg-gray-600 opacity-50 pointer-events-none'}`}>
                    Continue to Recording
                </Link>
            </div>
        </div>
    );
}