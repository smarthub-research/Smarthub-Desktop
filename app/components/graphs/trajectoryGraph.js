
'use client';

import {CartesianGrid, Scatter, ScatterChart, XAxis, YAxis} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { memo, useMemo, useState } from "react";
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

function TrajectoryGraph({data, graphId}) {
    const chartConfig = {
        trajectory: {
            label: "Trajectory",
            color: CHART_COLORS.purple,
        },
    };

    const effectiveGraphId = graphId || `graph-${Math.random().toString(36).substr(2, 9)}`;
    const pathName = usePathname();
    const animate = pathName !== '/recorder';

    // Calculate axis domains for better scaling
    const xValues = data?.map(d => d.trajectory_x).filter(v => typeof v === "number");
    const yValues = data?.map(d => d.trajectory_y).filter(v => typeof v === "number");
    
    const xMin = xValues && xValues.length ? Math.min(...xValues) : 0;
    const xMax = xValues && xValues.length ? Math.max(...xValues) : 1;
    const yMin = yValues && yValues.length ? Math.min(...yValues) : 0;
    const yMax = yValues && yValues.length ? Math.max(...yValues) : 1;
    
    const xPadding = (xMax - xMin) * 0.1 || 1;
    const yPadding = (yMax - yMin) * 0.1 || 1;
    
    const xDomain = [xMin - xPadding, xMax + xPadding];
    const yDomain = [yMin - yPadding, yMax + yPadding];

    const [dataPointCount, setDataPointCount] = useState(0); // 0 means show all data
    const [scrollPosition, setScrollPosition] = useState(0);

    return (
        <Card className="h-full flex flex-col gap-2 py-4">
            <CardHeader>
                    <div className={'flex flex-row justify-between items-center'}>
                        <div className="font-medium text-sm">Trajectory</div>
                        <ChartToolbar
                            dataPointCount={dataPointCount}
                            setDataPointCount={setDataPointCount}
                            scrollPosition={scrollPosition}
                            setScrollPosition={setScrollPosition}
                            data={data}
                            graphId={effectiveGraphId}
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
                                name="Trajectory"
                                data={data}
                                fill="transparent"
                                line={{ stroke: CHART_COLORS.purple, strokeWidth: 2 }}
                                shape={"circle"}
                                isAnimationActive={false}
                            />
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