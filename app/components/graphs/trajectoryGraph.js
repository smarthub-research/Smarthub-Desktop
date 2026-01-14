
/**
 * TrajectoryGraph Component
 * Displays trajectory data as a scatter plot showing x and y positions over time.
 * Supports comparison data and includes toolbar controls for data point selection.
 * Props:
 * - data: Array of trajectory data points with trajectory_x and trajectory_y
 * - comparisonData: Optional array for comparison trajectory
 * - graphId: Unique identifier for the graph
 * - isDownsampled: Boolean indicating if data is downsampled
 * - onRequestFullData: Callback to request full data
 * - loadingFullData: Boolean for loading state
 */
'use client';

import {CartesianGrid, Scatter, ScatterChart, XAxis, YAxis} from "recharts"
import { Card, CardContent, CardHeader } from "../ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { memo, useState, useMemo, useCallback, useEffect } from "react";
import ChartToolbar from "../../recorder/chartToolbar";
import {usePathname} from "next/navigation";

// Constants for chart colors
const CHART_COLORS = {
    red: 'rgb(239, 68, 68)',
    blue: 'rgb(59, 130, 246)',
    green: 'rgb(34, 197, 94)',
    yellow: 'rgb(250, 204, 21)',
    purple: '#8884d8'
}

function TrajectoryGraph({data, comparisonData, graphId, isDownsampled, onRequestFullData, loadingFullData}) {
    const chartConfig = {
        trajectory: {
            label: "Trajectory",
            color: CHART_COLORS.purple,
        },
        comparison: {
            label: "Comparison",
            color: "#ff9800",
        },
    };

    const effectiveGraphId = graphId || `graph-${Math.random().toString(36).substr(2, 9)}`;
    const pathName = usePathname();
    const animate = pathName !== '/recorder';
    
    // Start with 2000 points if data is downsampled, otherwise show all
    const [dataPointCount, setDataPointCount] = useState(isDownsampled ? 2000 : 0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [hasRequestedFullData, setHasRequestedFullData] = useState(false);
    
    // Handle when user selects "All" data points
    const handleDataPointChange = useCallback((newCount) => {
        setDataPointCount(newCount);
        setScrollPosition(0);
        
        // If user selects "All" (0) and data is downsampled and we haven't requested full data yet
        if (newCount === 0 && isDownsampled && !hasRequestedFullData && onRequestFullData) {
            setHasRequestedFullData(true);
            onRequestFullData();
        }
    }, [isDownsampled, hasRequestedFullData, onRequestFullData]);
    
    // Reset hasRequestedFullData when isDownsampled changes (data loaded)
    useEffect(() => {
        if (!isDownsampled) {
            setHasRequestedFullData(false);
        }
    }, [isDownsampled]);

    // Calculate axis domains for better scaling - optimized single-pass calculation
    const { xDomain, yDomain } = useMemo(() => {
        if (!data || data.length === 0) {
            return { xDomain: [0, 1], yDomain: [0, 1] };
        }
        
        let xMin = Infinity, xMax = -Infinity;
        let yMin = Infinity, yMax = -Infinity;
        
        // Single pass through main data
        for (const point of data) {
            const x = point.trajectory_x;
            const y = point.trajectory_y;
            if (typeof x === "number") {
                if (x < xMin) xMin = x;
                if (x > xMax) xMax = x;
            }
            if (typeof y === "number") {
                if (y < yMin) yMin = y;
                if (y > yMax) yMax = y;
            }
        }
        
        // Include comparison data if present
        if (comparisonData) {
            for (const point of comparisonData) {
                const x = point.trajectory_x;
                const y = point.trajectory_y;
                if (typeof x === "number") {
                    if (x < xMin) xMin = x;
                    if (x > xMax) xMax = x;
                }
                if (typeof y === "number") {
                    if (y < yMin) yMin = y;
                    if (y > yMax) yMax = y;
                }
            }
        }
        
        if (xMin === Infinity || xMax === -Infinity) {
            xMin = 0; xMax = 1;
        }
        if (yMin === Infinity || yMax === -Infinity) {
            yMin = 0; yMax = 1;
        }
        
        const xPadding = (xMax - xMin) * 0.1 || 1;
        const yPadding = (yMax - yMin) * 0.1 || 1;
        
        return {
            xDomain: [xMin - xPadding, xMax + xPadding],
            yDomain: [yMin - yPadding, Math.max(-2.5, yMax + yPadding)]
        };
    }, [data, comparisonData]);

    return (
        <Card className="h-full flex flex-col gap-2 py-4">
            <CardHeader>
                    <div className={'flex flex-row justify-between items-center'}>
                        <div className="font-medium text-sm">Trajectory</div>
                        <ChartToolbar
                            dataPointCount={dataPointCount}
                            setDataPointCount={handleDataPointChange}
                            scrollPosition={scrollPosition}
                            setScrollPosition={setScrollPosition}
                            data={data}
                            graphId={effectiveGraphId}
                            loadingFullData={loadingFullData}
                            isDownsampled={isDownsampled}
                        />
                    </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
                {data && data.length > 0 ? (
                    <ChartContainer config={chartConfig} className={'h-full w-full min-h-0'}>
                        <ScatterChart
                            accessibilityLayer
                            data={data}
                            margin={{
                                top: 16,
                                right: 36,
                                bottom: 16,
                                left: 16,
                            }}
                        >
                            <CartesianGrid vertical={true} horizontal={true} />
                            <XAxis
                                type="number"
                                dataKey="trajectory_x"
                                name="X"
                                tickMargin={8}
                                tickFormatter={(value) => value.toFixed(2)}
                                domain={xDomain}
                                label={{
                                    value: "X Position (m)",
                                    position: "insideBottom",
                                    offset: -10,
                                    textAnchor: "middle"
                                }}
                            />
                            <YAxis
                                type="number"
                                dataKey="trajectory_y"
                                name="Y"
                                tickMargin={8}
                                tickFormatter={(value) => value.toFixed(2)}
                                domain={yDomain}
                                label={{
                                    value: "Y Position (m)",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 0,
                                    textAnchor: "middle"
                                }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Scatter
                                key="trajectory-current"
                                name="Current Test"
                                data={data}
                                fill="transparent"
                                line={{ stroke: CHART_COLORS.purple, strokeWidth: 2 }}
                                shape={"circle"}
                                isAnimationActive={false}
                            />
                            {comparisonData && comparisonData.length > 0 && (
                                <Scatter
                                    key="trajectory-comparison"
                                    name="Comparison Test"
                                    data={comparisonData}
                                    fill="transparent"
                                    line={{ stroke: "#ff9800", strokeWidth: 2, strokeDasharray: "5 5" }}
                                    shape={"circle"}
                                    isAnimationActive={false}
                                />
                            )}
                        </ScatterChart>
                    </ChartContainer>
                ) : (
                    <div className="h-full flex flex-col justify-center items-center grow p-4 text-center">
                        <div className="text-gray-400 mb-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mx-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium">No trajectory data available</p>
                        <p className="text-gray-500 text-sm mt-1">Data will appear when available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default memo(TrajectoryGraph);