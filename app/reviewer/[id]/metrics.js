import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Activity, TrendingUp, Hash, Zap } from "lucide-react";

export default function Metrics({ testData, comparisonData }) {
    const dummyData = {
        "bout": [
		    82.6336228426765
	    ],
        "bout_dist": [
            159.46297543984468
        ],
        "bout_num": [
            1
        ],
        "st_freq_su": [
            43.77913730469715
        ],
    }

    // Format metric names for better display
    const formatMetricName = (key) => {
        const nameMap = {
            'bout': 'Bout Duration',
            'bout_dist': 'Bout Distance',
            'bout_num': 'Number of Bouts',
            'st_freq_su': 'Stride Frequency (Unsmoothed)',
        };
        return nameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Get appropriate unit for each metric
    const getUnit = (key) => {
        if (key.includes('dist')) return 'm';
        if (key.includes('freq')) return 'Hz';
        if (key === 'bout') return 's';
        return '';
    };

    // Get icon for metric type
    const getIcon = (key) => {
        if (key === 'bout') return <Activity className="w-4 h-4" />;
        if (key === 'bout_dist') return <TrendingUp className="w-4 h-4" />;
        if (key === 'bout_num') return <Hash className="w-4 h-4" />;
        if (key.includes('freq')) return <Zap className="w-4 h-4" />;
        return <Activity className="w-4 h-4" />;
    };

    // Get color scheme for metric type
    const getColorClass = (key) => {
        if (key === 'bout') return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300';
        if (key === 'bout_dist') return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300';
        if (key === 'bout_num') return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300';
        if (key.includes('freq')) return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300';
        return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300';
    };

    return (
        <Card className={'w-full'}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Performance Metrics
                    </CardTitle>
                    <Badge variant="secondary">{Object.keys(dummyData).length} metrics</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(dummyData).map((key) => {
                        const value = Array.isArray(dummyData[key]) ? dummyData[key][0] : dummyData[key];
                        const unit = getUnit(key);
                        
                        return (
                            <div 
                                key={key} 
                                className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getColorClass(key)}`}>
                                    {getIcon(key)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {formatMetricName(key)}
                                    </p>
                                    <p className="text-2xl font-bold truncate">
                                        {typeof value === 'number' ? value.toFixed(2) : value}
                                        {unit && <span className="text-lg font-normal text-muted-foreground ml-1">{unit}</span>}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    )
}