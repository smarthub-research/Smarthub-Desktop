import { CheckCircle, Play, Settings, Target, Wifi } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

// Visual, step-by-step component that shows the calibration workflow.
// Props:
// - `currentStep` (number): zero-based index of the current step used
//    to render active/completed/pending styles.
export default function CalibrationSteps({currentStep = 0}) {
    // Static list of steps describing the calibration flow. Each item
    // includes an icon, description, and a short requirement badge.
    const calibrationSteps = [
        {
            title: "Connect Devices",
            description: "Ensure both left and right SmartHub sensors are connected",
            icon: Wifi,
            requirement: "2 devices required"
        },
        {
            title: "Position Tests",
            description: "Position tester on a flat surface with clear 10-meter path",
            icon: Target,
            requirement: "Straight line setup"
        },
        {
            title: "Record Movement",
            description: "Drive straight forward 10 meters, then turn around and return",
            icon: Play,
            requirement: "~30 second recording"
        },
        {
            title: "Process Data",
            description: "Analyze gyroscope data to calculate calibration parameters",
            icon: Settings,
            requirement: "Automatic processing"
        }
    ];

    // Helper to map a step index to a simple status string used for
    // conditional styling in the UI.
    const getStepStatus = (stepIndex) => {
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep) return 'active';
        return 'pending';
    };

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calibrationSteps.map((step, index) => {
                const status = getStepStatus(index);
                const Icon = step.icon;

                // Each step displays an icon which changes appearance
                // depending on whether the step is completed, active, or pending.
                return (
                    <Card key={index} className={`$
{status === 'active' ? 'ring-2 ring-blue-500' : ''} ${status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    status === 'completed' ? 'bg-green-500 text-white' :
                                    status === 'active' ? 'bg-blue-500 text-white' :
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                    {status === 'completed' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                </div>
                                <CardTitle className="text-sm">{step.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-xs">{step.description}</CardDescription>
                            <Badge variant="outline" className="mt-2 text-xs">
                                {step.requirement}
                            </Badge>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    )
}