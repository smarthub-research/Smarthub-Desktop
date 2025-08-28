import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function LiveData({calibrationStep, calibrationData}) {
    const [recordingTime, setRecordingTime] = useState(0)
    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Data</CardTitle>
            </CardHeader>
            <CardContent>
                {calibrationStep === 'recording' && (
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Recording Time:</span>
                            <span className="font-mono">{recordingTime.toFixed(1)}s</span>
                        </div>
                        {calibrationData && (
                            <>
                                <div className="flex justify-between">
                                    <span>Left Gyro:</span>
                                    <span className="font-mono">
                                        {calibrationData.gyro_left?.slice(-1)[0]?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Right Gyro:</span>
                                    <span className="font-mono">
                                        {calibrationData.gyro_right?.slice(-1)[0]?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Data Points:</span>
                                    <span className="font-mono">
                                        {calibrationData.gyro_left?.length || 0}
                                    </span>
                                </div>
                            </>
                        )}
                        {!calibrationData && (
                            <div className="text-amber-600 text-sm">
                                Waiting for sensor data...
                            </div>
                        )}
                    </div>
                )}
                
                {calibrationStep === 'processing' && (
                    <div className="text-blue-600 text-sm">
                        Processing calibration data...
                    </div>
                )}
                
                {calibrationStep === 'idle' && (
                    <p className="text-gray-500 text-sm">Start calibration to see live sensor data</p>
                )}
                
                {calibrationStep === 'error' && (
                    <p className="text-red-500 text-sm">Error occurred during calibration</p>
                )}
            </CardContent>
        </Card>
    )
}