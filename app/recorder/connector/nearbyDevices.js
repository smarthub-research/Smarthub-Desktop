
import Device from "./device";
import {useState} from "react";

// Component for displaying nearby BLE devices that can be connected.
// Props:
// - `devices`: Array of nearby device objects.
// - `deviceOne`: Object representing the first connected device, or null.
// - `deviceTwo`: Object representing the second connected device, or null.
// - `setDeviceOne`: Function to set the first device.
// - `setDeviceTwo`: Function to set the second device.
// Purpose: Lists available devices, filters out already connected ones, and allows connecting to up to two devices.
export default function NearbyDevices({devices, deviceOne, deviceTwo, setDeviceOne, setDeviceTwo}) {
    const [isCollapsed, setCollapsed] = useState(false)

    // Function to handle connecting a new device, assigning it to the first available slot
    function handleConnect(device) {
        if (!deviceOne) {
            setDeviceOne(device);
        } else if (!deviceTwo) {
            setDeviceTwo(device);
        }
    }

    return (
        <div className={`w-full flex-grow`}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Nearby</h3>
            </div>
            <div className={'flex flex-col py-2 space-y-3 w-full h-fit grow justify-center'}>
                {devices.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Searching for devices...</p>
                ) : (
                    // Filter out devices that are already connected and map to Device components
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
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    )
}