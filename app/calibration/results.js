import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrendingUp } from 'lucide-react';

// Presentation component for calibration results. The component expects
// a `results` object (e.g. { leftGain, rightGain, wheel_dist }) to be
// provided by a parent; currently the file references `results` but it
// is not declared here — pass results via props when integrating.
export default function Results() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Results</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Left Gain:</span>
                        <span className="font-mono">{results.leftGain?.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Right Gain:</span>
                        <span className="font-mono">{results.rightGain?.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Wheel Distance:</span>
                        <span className="font-mono">{results.wheel_dist?.toFixed(3)}m</span>
                    </div>
                </div>
                <Badge className="mt-3 w-full justify-center" variant="default">
                    Calibration Saved
                </Badge>
            </CardContent>
        </Card>
    )
}