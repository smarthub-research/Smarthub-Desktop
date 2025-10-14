'use client';

import {CartesianGrid, Label, Line, LineChart, XAxis, YAxis} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { memo, useEffect, useRef, useState, useMemo } from "react";
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

function SmoothedGraph() {
    const [testData, setTestData] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load JSON data from public folder
        Promise.all([
            fetch('/testing.json').then(res => res.json()),
            fetch('/exported_test_results.json').then(res => res.json())
        ])
        .then(([testDataJson, resultsJson]) => {
            setTestData(testDataJson);
            setResults(resultsJson);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            setLoading(false);
        });
    }, []);

    const chartData = useMemo(() => {
        if (!testData || !results) return [];
        
        // Transform the data from arrays to array of objects for recharts
        const length = Math.min(
            testData.elapsed_time_s?.length || 0,
            results.displacement_m?.length || 0,
            testData.displacement_m?.length || 0
        );
        
        return Array.from({ length }, (_, i) => ({
            time: testData.elapsed_time_s[i],
            result: results.displacement_m[i],
            expected: testData.displacement_m[i]
        }));
    }, [testData, results]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: "var(--chart-1)",
        },
    };

    // Y Axis domain calculation
    const yValues = [...(chartData.map(d => d.result) || []), ...(chartData.map(d => d.expected) || [])];
    const yMin = yValues.length ? Math.min(...yValues) : 0;
    const yMax = yValues.length ? Math.max(...yValues) : 1;
    const yPadding = (yMax - yMin) * 0.3 || 1;
    const domain = [yMin - yPadding, yMax + yPadding];

    return (
        <Card className="h-full flex flex-col gap-2 py-4">
            <CardContent className="flex-1 flex flex-col p-0">
                <ChartContainer config={chartConfig} className={'h-full w-full min-h-0'}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                            margin={{
                                top: 16,
                                right: 36,
                                bottom: 16,
                                left: 16,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey={"time"}
                                // tickLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.toFixed(2)}
                                label={{
                                    value: "Time (sec)",
                                    position: "insideBottom",
                                    offset: -10, // Negative value moves label up, positive moves down
                                    textAnchor: "middle"
                                }}
                            />
                            <YAxis
                                tickLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.toFixed(2)}
                                domain={domain}
                                label={{
                                    value: "Displacement (m)",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 0, // Adjust horizontal spacing from axis
                                    textAnchor: "middle"
                                }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Line
                                dataKey={"result"}
                                type={"natural"}
                                stroke={CHART_COLORS.red}
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                            />
                            <Line
                                dataKey={"expected"}
                                type={"natural"}
                                stroke={CHART_COLORS.blue}
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                            />

                        </LineChart>
                    </ChartContainer>
                )
            </CardContent>
        </Card>
    )
}

export default memo(SmoothedGraph);