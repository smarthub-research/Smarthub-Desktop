"use client";

import { Suspense, lazy } from "react";
import { Card, CardContent } from "../../components/ui/card";

// Lazy load graph components
const Graph = lazy(() => import("../../components/graphs/graph"));
const TrajectoryGraph = lazy(() => import("../../components/graphs/trajectoryGraph"));

// Loading skeleton for graphs
function GraphSkeleton() {
    return (
        <Card className="h-full flex flex-col gap-2 py-4 animate-pulse">
            <CardContent className="flex-1 flex flex-col p-4 justify-center items-center">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 mt-4">Loading graph...</p>
            </CardContent>
        </Card>
    );
}

export default function GraphSection({testData, comparisonData, onRequestFullData, loadingFullData}) {
    const isDownsampled = testData?.data_info?.is_downsampled;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full grow min-h-0">
            <Suspense fallback={<GraphSkeleton />}>
                <Graph 
                    data={testData.distance} 
                    comparisonData={comparisonData?.distance}
                    isDownsampled={isDownsampled}
                    onRequestFullData={onRequestFullData}
                    loadingFullData={loadingFullData}
                />
            </Suspense>
            <Suspense fallback={<GraphSkeleton />}>
                <Graph 
                    data={testData.heading} 
                    comparisonData={comparisonData?.heading}
                    isDownsampled={isDownsampled}
                    onRequestFullData={onRequestFullData}
                    loadingFullData={loadingFullData}
                />
            </Suspense>
            <Suspense fallback={<GraphSkeleton />}>
                <Graph 
                    data={testData.velocity} 
                    comparisonData={comparisonData?.velocity}
                    isDownsampled={isDownsampled}
                    onRequestFullData={onRequestFullData}
                    loadingFullData={loadingFullData}
                />
            </Suspense>
            <Suspense fallback={<GraphSkeleton />}>
                <TrajectoryGraph 
                    data={testData.trajectory} 
                    comparisonData={comparisonData?.trajectory}
                    isDownsampled={isDownsampled}
                    onRequestFullData={onRequestFullData}
                    loadingFullData={loadingFullData}
                />
            </Suspense>
        </div>
    )
}