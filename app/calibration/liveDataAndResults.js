
import { useState, useEffect, useCallback } from 'react';
import LiveData from './liveData';
import Results from './results';

export default function LiveDataAndResults({calibrationStep}) {
    const [results, setResults] = useState("");
    const [calibrationData, setCalibrationData] = useState({
        smarthubId: "",
        calibrationName: "",
        gyroLeft: [],
        gyroRight: [],
        timeStamps: []
    })

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
            {calibrationData.length > 0 && (
                <LiveData calibrationStep={calibrationStep} calibrationData={calibrationData}/>
            )}

            {results && (
                <Results/>
            )}
        </div>
    );
}
