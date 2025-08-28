import CalibrationSVG from "./svg/calibrationSVG";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";

// Component to display a card for the RecorderTab feature
export default function Calibration() {
    return (
        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                        <CalibrationSVG margin={0}/>
                    </div>
                    <CardTitle className="text-base">Calibrator</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription>Start calibrating your devices</CardDescription>
            </CardContent>
        </Card>
    )
}