
import { useState, useEffect, useCallback } from 'react';
import LiveData from './liveData';
import Results from './results';

export default function LiveDataAndResults({calibrationStep}) {
    const [results, setResults] = useState("");
    const [calibrationData, setCalibrationData] = useState({
        smarthub_id: "",
        calibration_name: "",
        gyro_left: [],
        gyro_right: [],
        time_from_start: []
    })

    const handleData = useCallback((data) => {
        data = data.data
        // Update testData with the new formatted data from BLE service
        setCalibrationData(prevCalibrationData => ({
            ...prevCalibrationData,
            gyro_left: [...prevCalibrationData.gyro_left, ...data.gyro_left.flat()],
            gyro_right: [...prevCalibrationData.gyro_right, ...data.gyro_right.flat()],
            time_from_start: [...prevCalibrationData.time_from_start, ...data.timeStamp],
        }));
    })

    useEffect(() => {
        if (window.electronAPI) {
            // Register listeners and store their cleanup functions
            const removeBleListener = window.electronAPI.onBLEData(handleData);

            // Return combined cleanup function
            return () => {
                if (removeBleListener) removeBleListener();
            };
        }
    }, [handleData]);

    return (
        <div className="space-y-4">
            <LiveData calibrationStep={calibrationStep} calibrationData={calibrationData}/>

            {results && (
                <Results/>
            )}
        </div>
    );
}
