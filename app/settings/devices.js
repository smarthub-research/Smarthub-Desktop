import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import ConnectedDevices from "../recorder/connector/connectedDevices";
import NearbyDevices from "../recorder/connector/nearbyDevices";
import useFetchDevices from "../recorder/hooks/useFetchDevices";
import Calibration from "./calibration";

export default function Devices() {
    const { devices, deviceOne, deviceTwo, setDeviceOne, setDeviceTwo } = useFetchDevices();

    return (
        <div className="flex flex-col gap-8">
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
                    <ConnectedDevices
                        deviceOne={deviceOne}
                        deviceTwo={deviceTwo}
                        setDeviceOne={setDeviceOne}
                        setDeviceTwo={setDeviceTwo}
                    />
                    <hr className={'mt-4 mb-4'}/>
                    <NearbyDevices
                        devices={devices}
                        deviceOne={deviceOne}
                        deviceTwo={deviceTwo}
                        setDeviceOne={setDeviceOne}
                        setDeviceTwo={setDeviceTwo}
                    />
                </CardContent>
            </Card>

            <Calibration/>
        </div>
    )
}