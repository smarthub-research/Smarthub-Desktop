import Device from "./device";

// Component for displaying and managing connected devices in the recorder interface.
// Props:
// - `deviceOne`: Object representing the first connected device, or null if not connected.
// - `deviceTwo`: Object representing the second connected device, or null if not connected.
// - `setDeviceOne`: Function to update the state of the first device.
// - `setDeviceTwo`: Function to update the state of the second device.
// Purpose: Allows users to view connected devices and disconnect them individually or all at once.
export default function ConnectedDevices({deviceOne, deviceTwo, setDeviceOne, setDeviceTwo}) {

    // Function to handle disconnecting a specific device by name
    function handleDisconnect(device) {
        if (deviceOne && deviceOne.name === device.name) {
            setDeviceOne(null);
        } else if (deviceTwo && deviceTwo.name === device.name) {
            setDeviceTwo(null);
        }
    }

    // Asynchronous function to disconnect all devices and reset the device state
    async function handleDisconnectAll() {
        await window.electronAPI.resetDevices();
        setDeviceOne(null);
        setDeviceTwo(null);
    }

    return (
        <div className="w-full h-fit">
            <div className="flex items-center justify-between pb-1">
                <h3 className="text-lg font-semibold">Connected</h3>
                <button className={'opacity-50 cursor-pointer'} onClick={handleDisconnectAll}>
                    Disconnect all
                </button>
            </div>
            <div className="flex flex-col space-y-3 w-full h-fit grow justify-center">
                {deviceOne || deviceTwo ? (
                    <>
                        {deviceOne && (
                            <Device
                                device={deviceOne}
                                status={'connected'}
                                onDisconnect={handleDisconnect}
                            />
                        )}
                        {deviceTwo && (
                            <Device
                                device={deviceTwo}
                                status={'connected'}
                                onDisconnect={handleDisconnect}
                            />
                        )}
                    </>
                ) : (
                    <p>No devices connected</p>
                )}
            </div>
        </div>
    )
}