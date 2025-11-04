import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import useFetchDevices from "../recorder/hooks/useFetchDevices";

export default function StaticCalibration() {
    const [isCalibrating, setIsCalibrating] = useState(false)
    const [calibrationStatus, setCalibrationStatus] = useState("")
    const { deviceOne, deviceTwo } = useFetchDevices();

    useEffect(() => {
        // Listen for calibration completion event from backend
        if (window.electronAPI?.onCalibrationComplete) {
            const cleanup = window.electronAPI.onCalibrationComplete((results) => {
                console.log("Calibration completed automatically!", results);
                setIsCalibrating(false);
                setCalibrationStatus("Complete!");
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    setCalibrationStatus("");
                }, 5000);
            });

            return cleanup;
        }
    }, []);

    const beginStaticCalibration = async () => {
        console.log("starting static calibration")
        try{
            if (window.electronAPI) {
                setIsCalibrating(true)
                setCalibrationStatus("Calibrating...")
                await window.electronAPI.beginStaticCalibration()
                // Note: isCalibrating will be set to false by the onCalibrationComplete event
            }
        } catch (e) {
            console.error("Static calibration error: ", e)
            setIsCalibrating(false)
            setCalibrationStatus("Error occurred")
            setTimeout(() => {
                setCalibrationStatus("");
            }, 3000);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Static Calibration
                </CardTitle>
                <CardDescription>
                    Statically calibrate devices
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button
                    className={`${isCalibrating && "bg-yellow-600"} px-3 py-1 text-center 
                    rounded-md transition-all duration-300 text-sm font-medium cursor-pointer`}                    
                    variant="default"
                    onClick={beginStaticCalibration}
                    disabled={isCalibrating || (!deviceOne || !deviceTwo)}
                >
                    {isCalibrating ? "Calibrating..." : "Start"}
                </Button>
                {calibrationStatus && (
                    <p className={`text-sm ${
                        calibrationStatus === "Complete!" ? "text-green-600" : 
                        calibrationStatus.includes("Error") ? "text-red-600" : 
                        "text-yellow-600"
                    }`}>
                        {calibrationStatus}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}