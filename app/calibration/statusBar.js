import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Wifi } from 'lucide-react';

export default function StatusBar({ calibrationState, recordingTime, connectedDevices }) {
    const getStatusColor = () => {
        switch (calibrationState) {
            case 'recording': return 'bg-blue-500';
            case 'processing': return 'bg-yellow-500';
            case 'completed': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                        <span className="font-medium capitalize">{calibrationState}</span>
                        {calibrationState === 'recording' && (
                            <Badge variant="secondary">
                                {recordingTime.toFixed(1)}s
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4" />
                        <span>{connectedDevices}/2 devices</span>
                        <Badge variant={connectedDevices === 2 ? "default" : "destructive"}>
                            {connectedDevices === 2 ? "Ready" : "Missing"}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
