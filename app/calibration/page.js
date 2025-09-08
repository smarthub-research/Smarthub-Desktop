"use client";

import { useState, useEffect } from 'react';
import Instructions from './instructions';
import CalibrationSteps from './calibrationSteps';
import Controls from './controls';
import LiveDataAndResults from './liveDataAndResults';

export default function Calibration() {
    const [calibrationStep, setCalibrationStep] = useState("connecting"); // "connecting" "idle", "recording", "processing", "error", "completed"
    const [calibrationName, setCalibrationName] = useState("");
    const [connectedDevices, setConnectedDevices] = useState([null, null]);

        // Map calibration step strings to numeric indices
    const getStepIndex = (step) => {
        const stepMap = {
            "connecting": 0,
            "idle": 1,
            "recording": 2,
            "processing": 3,
            "completed": 4,
            "error": 1 // Show as step 1 (positioning) if there's an error
        };
        return stepMap[step] || 0;
    };

    // Get the currently connected devices
    useEffect(() => {
        async function fetchDevices() {
            try {
                const result = await window.electronAPI.getConnectedDevices();
                // Ensure that we got devices returned before we update state
                if (result.length > 0) {
                    setConnectedDevices(result);
                    setCalibrationStep("idle")
                }
            } catch (error) {
                console.error("Error fetching devices:", error);
            }
        }

        fetchDevices();
    }, []);

    return (
        <div className="mt-12 max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Smarthub Calibrator
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Calibrate your devices parameters for accurate movement tracking
                </p>
            </div>

            {/* Calibration Steps */}
            <CalibrationSteps currentStep={getStepIndex(calibrationStep)} />

            {/* Main Control Panel */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Control Section */}
                <div className="lg:col-span-2 space-y-4">
                    <Controls
                        setCalibrationStep={setCalibrationStep}
                        calibrationStep={calibrationStep}
                        calibrationName={calibrationName}
                        setCalibrationName={setCalibrationName} 
                        connectedDevices={connectedDevices}
                    />
                    <Instructions />
                </div>

                {/* Results Section */}
                <LiveDataAndResults
                    calibrationStep={calibrationStep}
                />
            </div>
        </div>
    );
}