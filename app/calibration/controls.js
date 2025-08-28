import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, AlertCircle, Play, Square, Zap } from 'lucide-react';
import CalibrationName from './calibrationName';

export default function Controls({calibrationStep, setCalibrationStep, calibrationName, setCalibrationName, connectedDevices}) {

    async function startCalibration() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.beginReadingData();
                setCalibrationStep("recording")
            }
        } catch (error) {
            console.error("Error starting BLE reading:", error);
        }
    }

    async function stopCalibration() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.stopRecordingData();
                setCalibrationStep("processing")
                // Set test data to be fetched by livedataandresults with no formatting
                await window.electronAPI.setTestData(false);
            }
        } catch (error) {
            console.error("Error stopping recording:", error);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Calibration Control</CardTitle>
                <CardDescription>
                    Follow the steps to calibrate your SmartHub robot's movement parameters
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <CalibrationName calibrationStep={calibrationStep} calibrationName={calibrationName} setCalibrationName={setCalibrationName}/>

                <div className="flex space-x-3">
                    {calibrationStep === 'idle' && (
                        <button 
                            onClick={startCalibration}
                            disabled={connectedDevices < 2}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Play className="w-4 h-4" />
                            <span>Start Calibration</span>
                        </button>
                    )}
                    
                    {calibrationStep === 'recording' && (
                        <button 
                            onClick={stopCalibration}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <Square className="w-4 h-4" />
                            <span>Stop Recording</span>
                        </button>
                    )}

                    {(calibrationStep === 'completed' || calibrationStep === 'error') && (
                        <button 
                            onClick={resetCalibration}
                            className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Zap className="w-4 h-4" />
                            <span>New Calibration</span>
                        </button>
                    )}
                </div>

                {calibrationStep === 'processing' && (
                    <div className="flex items-center space-x-2 text-yellow-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing calibration data...</span>
                    </div>
                )}

                {calibrationStep === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>Calibration failed. Please try again.</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}