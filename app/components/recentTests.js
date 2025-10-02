import ViewButton from "./viewButton";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Badge} from "./ui/badge";
import {Clock} from "lucide-react";
import Link from "next/link";

// Displays 10 of the most recent tests
export default function RecentTests({testFiles, loading = false}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Tests</CardTitle>
                    <Badge variant="secondary">{testFiles.length} tests</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    <div className="p-6 text-center opacity-50">Loading tests...</div>
                ) : testFiles.length === 0 ? (
                    <div className="p-6 text-center opacity-50">No recent tests found</div>
                ) : (
                    testFiles.slice(0, 10).map((test) => (
                        <div key={test.id} className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">{test.test_name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(test.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <ViewButton test={test}/>
                        </div>
                    ))
                )}
                <Link href={'/reviewer'}>
                    <div className="justify-center align-center text-center grow cursor-pointer font-semibold
                    hover:bg-surface-200 border w-full mt-4 py-1 bg-transparent rounded-sm">
                        View All Tests
                    </div>
                </Link>

            </CardContent>
        </Card>
    );
}