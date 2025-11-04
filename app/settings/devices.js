import Calibration from "./calibration";
import DeviceConnection from "./deviceConnection";
import StaticCalibration from "./staticCalibration";

export default function Devices() {

    return (
        <div className="flex flex-col gap-8">
            <DeviceConnection/>
            <Calibration/>
            <StaticCalibration/>
        </div>
    )
}