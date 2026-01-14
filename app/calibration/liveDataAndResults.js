
import { useState, useEffect, useCallback } from 'react';
import LiveData from './liveData';
import Results from './results';

// Container component that wires live BLE data into the LiveData
// presentation component and displays final Results when available.
// Props:
// - `calibrationStep` (string): current step used to control rendering.
export default function LiveDataAndResults({calibrationStep}) {
    const [results, setResults] = useState("");
    // calibrationData stores accumulated arrays of gyro readings and timestamps.
    const [calibrationData, setCalibrationData] = useState({
        smarthubId: "",
        calibrationName: "",
        gyroLeft: [],
        gyroRight: [],
        timeStamps: []
    })

    // Callback invoked by Electron's BLE listener to merge incoming
    // packets into the accumulated calibration data.
    const handleData = useCallback((data) => {
        data = data.data
        // Update testData with the new formatted data from BLE service
        setCalibrationData(prevCalibrationData => ({
            ...prevCalibrationData,
            gyroLeft: [...prevCalibrationData.gyroLeft, ...data.gyroLeft.flat()],
            gyroRight: [...prevCalibrationData.gyroRight, ...data.gyroRight.flat()],
            timeStamps: [...prevCalibrationData.timeStamps, ...data.timeStamp],
        }));
    })

    useEffect(() => {
        if (window.electronAPI) {
            // Register BLE data listener. The bridge returns a cleanup
            // function which we call on unmount.
            const removeBleListener = window.electronAPI.onBLEData(handleData);

            return () => {
                if (removeBleListener) removeBleListener();
            };
        }
    }, [handleData]);

    return (
        <div className="space-y-4">
            {/* Note: `calibrationData` is an object — checking `.length`
                will always be undefined. If the intent is to hide this
                section until arrays have data, check `calibrationData.gyroLeft.length`.
            */}
            {calibrationData.length > 0 && (
                <LiveData calibrationStep={calibrationStep} calibrationData={calibrationData}/>
            )}

            {results && (
                <Results/>
            )}
        </div>
    );
}
