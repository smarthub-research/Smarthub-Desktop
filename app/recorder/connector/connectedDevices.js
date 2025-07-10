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

    return (
        <div className="w-full h-fit">
            <div className={'flex flex-row justify-between items-center pr-1'}>
                <p className="text-lg md:text-xl font-bold mb-3">Connected</p>
                <p className={'opacity-50 cursor-pointer'}
                   onClick={async () => {
                       await window.electronAPI.resetDevices();
                       setDeviceOne(null);
                       setDeviceTwo(null);
                   }}>Disconnect all</p>
            </div>
            <div className="flex flex-col bg-white py-2 px-4 rounded-lg w-full divide-y divide-black h-fit grow justify-center shadow-sm">
                {deviceOne ? (
                    <Device
                        device={deviceOne}
                        status={'connected'}
                        onDisconnect={handleDisconnect}
                    />
                ) : (
                    <Device
                        device={{name:"No Connected Device"}}
                    />
                )}
                {deviceTwo ? (
                    <Device
                        device={deviceTwo}
                        status={'connected'}
                        onDisconnect={handleDisconnect}
                    />
                ) : (
                    <Device
                        device={{name:"No Connected Device"}}
                    />
                )}
            </div>
        </div>
    )
}