import Calibration from "./calibration";
import DeviceConnection from "./deviceConnection";
import StaticCalibration from "./staticCalibration";

/**
 * Devices
 * Parent settings page that groups device-related settings together. The
 * component currently renders the Bluetooth device connection controls and
 * leaves hooks for calibration UIs that can be toggled on as needed.
 */
export default function Devices() {

    return (
        <div className="flex flex-col gap-8">
            <DeviceConnection/>
            {/* Calibration UIs can be enabled when needed:
                <Calibration/>
                <StaticCalibration/>
            */}
        </div>
    )
}