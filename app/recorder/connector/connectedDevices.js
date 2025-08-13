import Device from "./device";

export default function ConnectedDevices({deviceOne, deviceTwo, setDeviceOne, setDeviceTwo}) {

    // Function to handle disconnecting a device
    function handleDisconnect(device) {
        if (deviceOne && deviceOne.name === device.name) {
            setDeviceOne(null);
        } else if (deviceTwo && deviceTwo.name === device.name) {
            setDeviceTwo(null);
        }
    }

    async function handleDisconnectAll() {
        await window.electronAPI.resetDevices();
        setDeviceOne(null);
        setDeviceTwo(null);
    }

    return (
        <div className="w-full h-fit">
            <div className="flex items-center justify-between">
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