import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import ConnectedDevices from "../recorder/connector/connectedDevices";
import NearbyDevices from "../recorder/connector/nearbyDevices";
import useFetchDevices from "../recorder/hooks/useFetchDevices";

/**
 * DeviceConnection
 * Orchestrates device pairing and display of currently connected devices.
 * Uses `useFetchDevices` to obtain device state and renders a summary of
 * connected devices plus a list of nearby devices to pair when needed.
 */
export default function DeviceConnection() {
    const { devices, deviceOne, deviceTwo, setDeviceOne, setDeviceTwo } = useFetchDevices();
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Bluetooth Devices
                    </CardTitle>
                    <CardDescription>Manage your connected BLE devices</CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                {/* Show currently connected devices first */}
                <ConnectedDevices
                    deviceOne={deviceOne}
                    deviceTwo={deviceTwo}
                    setDeviceOne={setDeviceOne}
                    setDeviceTwo={setDeviceTwo}
                />
                {/* If both required devices are not connected, show nearby devices to pair */}
                {!(deviceOne && deviceTwo) &&
                    <>
                        <hr className={'mt-4 mb-4'}/>
                        <NearbyDevices
                            devices={devices}
                            deviceOne={deviceOne}
                            deviceTwo={deviceTwo}
                            setDeviceOne={setDeviceOne}
                            setDeviceTwo={setDeviceTwo}
                        />                    
                    </>
                }

            </CardContent>
        </Card>
    )
}