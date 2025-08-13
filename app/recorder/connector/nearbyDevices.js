
import Device from "./device";
import {useState} from "react";

export default function NearbyDevices({devices, deviceOne, deviceTwo, setDeviceOne, setDeviceTwo}) {
    const [isCollapsed, setCollapsed] = useState(false)

    // Function to handle connecting a device
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
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    )
}