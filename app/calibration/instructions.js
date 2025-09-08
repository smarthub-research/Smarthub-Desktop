import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Hard coded instructions for users to perform calibrations
export default function Instructions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                        <span className="font-semibold text-blue-600">1.</span>
                        <span>Ensure both SmartHub sensors are connected and visible in the device list.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="font-semibold text-blue-600">2.</span>
                        <span>Position the tester on a flat surface with at least 10 meters of clear space ahead.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="font-semibold text-blue-600">3.</span>
                        <span>Click "Start Calibration" and move straight forward 10 meters.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="font-semibold text-blue-600">4.</span>
                        <span>Turn around and drive back to the starting position.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="font-semibold text-blue-600">5.</span>
                        <span>Click "Stop Recording" when back at the start. The system will calculate optimal parameters.</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}