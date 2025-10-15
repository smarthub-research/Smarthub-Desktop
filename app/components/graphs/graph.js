'use client';

import {CartesianGrid, Label, Line, LineChart, XAxis, YAxis} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { memo, useEffect, useRef, useState, useMemo } from "react";
import ChartToolbar from "../../recorder/chartToolbar";
import {usePathname} from "next/navigation";

function useDebouncedResize(delay = 100) {
    const [size, setSize] = useState({ width: 0, height: 0 });
    const ref = useRef();

    useEffect(() => {
        if (!ref.current) return;
        let timeout;
        
        const updateSize = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                setSize({
                    width: rect.width,
                    height: rect.height
                });
            }
        };
        
        const handleResize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(updateSize, delay);
        };
        
        // Create ResizeObserver for better container size tracking
        const resizeObserver = new ResizeObserver(handleResize);
        
        if (ref.current) {
            resizeObserver.observe(ref.current);
            updateSize(); // Initial size
        }
        
        window.addEventListener("resize", handleResize);
        
        return () => {
            clearTimeout(timeout);
            window.removeEventListener("resize", handleResize);
            resizeObserver.disconnect();
        };
    }, [delay]);

    return [ref, size];
}

// Constants for chart colors
const CHART_COLORS = {
    red: 'rgb(239, 68, 68)',
    blue: 'rgb(59, 130, 246)',
    green: 'rgb(34, 197, 94)',
    yellow: 'rgb(250, 204, 21)',
    purple: '#8884d8'
}

function Graph({data, comparisonData, graphId}) {
    // Only animate if not on recorder page
    const pathName = usePathname();
    const animate = pathName !== '/recorder';

    const [containerRef, containerSize] = useDebouncedResize(100);
    
    // State for ChartToolbar integration
    const [dataPointCount, setDataPointCount] = useState(0); // 0 means show all data
    const [scrollPosition, setScrollPosition] = useState(0);

    // Generate a fallback graphId if none provided
    const effectiveGraphId = graphId || `graph-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate the data slice to display based on toolbar controls
    const displayData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        // If dataPointCount is 0, show all data
        if (dataPointCount === 0) {
            return data;
        }
        
        // Calculate start and end positions for slicing
        const totalDataPoints = data.length;
        const endIndex = totalDataPoints - scrollPosition;
        const startIndex = Math.max(0, endIndex - dataPointCount);
        
        return data.slice(startIndex, endIndex);
    }, [data, dataPointCount, scrollPosition]);

    // Calculate comparison data slice with the same logic
    const displayComparisonData = useMemo(() => {
        if (!comparisonData || comparisonData.length === 0) return [];
        
        if (dataPointCount === 0) {
            return comparisonData;
        }
        
        const totalDataPoints = comparisonData.length;
        const endIndex = totalDataPoints - scrollPosition;
        const startIndex = Math.max(0, endIndex - dataPointCount);
        
        return comparisonData.slice(startIndex, endIndex);
    }, [comparisonData, dataPointCount, scrollPosition]);

    // Merge datasets to display both full datasets without trimming
    const mergedData = useMemo(() => {
        if (!displayData || displayData.length === 0) return [];
        if (!displayComparisonData || displayComparisonData.length === 0) return displayData;

        const maxLength = Math.max(displayData.length, displayComparisonData.length);
        const merged = [];

        for (let i = 0; i < maxLength; i++) {
            const currentPoint = displayData[i];
            const comparisonPoint = displayComparisonData[i];
            
            const mergedPoint = {};
            
            // Add current test data if it exists
            if (currentPoint) {
                Object.keys(currentPoint).forEach(key => {
                    mergedPoint[key] = currentPoint[key];
                });
            }
            
            // Add comparison values with a different key if comparison point exists
            if (comparisonPoint) {
                Object.keys(comparisonPoint).forEach(key => {
                    if (key !== 'time') {
                        mergedPoint[`${key}_comparison`] = comparisonPoint[key];
                    }
                });
                
                // If current data doesn't exist at this index, use comparison data's time/x-axis value
                if (!currentPoint) {
                    mergedPoint.time = comparisonPoint.time;
                    // Copy any axis data (like trajectory Y) but NOT the main data values
                    Object.keys(comparisonPoint).forEach(key => {
                        // Only copy non-primary data keys (time and potential secondary axis like trajectory)
                        if (key === 'time' || (!key.includes('distance') && !key.includes('velocity') && !key.includes('heading'))) {
                            if (!mergedPoint[key]) {
                                mergedPoint[key] = comparisonPoint[key];
                            }
                        }
                    });
                }
            }
            
            merged.push(mergedPoint);
        }

        return merged;
    }, [displayData, displayComparisonData]);

    // Find first non-time key
    const dataKey = mergedData && mergedData.length > 0
        ? Object.keys(mergedData[0]).find(key => key !== "time" && !key.endsWith("_comparison"))
        : "data";

    // Find a second non-time key (if there are 3+ keys total)
    const dataKeys = mergedData && mergedData.length > 0
        ? Object.keys(mergedData[0]).filter(key => key !== "time" && !key.endsWith("_comparison"))
        : [];

    // Only define dataKey2 if we have more than one non-time key
    const dataKey2 = dataKeys.length > 1 ? dataKeys[1] : null;
    
    // Comparison data key
    const comparisonKey = `${dataKey}_comparison`;

    // Regex to format title better. First char = (.) and rest=([^_]*)
    const title = dataKey ? dataKey.replace(/^(.)([^_]*)(_.*)?$/, (_, firstChar, rest) => {
        return firstChar.toUpperCase() + rest;
    }) : '';

    const chartColor =
        dataKey === 'distance' ? CHART_COLORS.red
            : dataKey === 'heading' ? CHART_COLORS.blue
                : dataKey === 'velocity' ? CHART_COLORS.green
                    : CHART_COLORS.yellow;

    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: "var(--chart-1)",
        },
    };

    // Y Axis domain calculation - include comparison data if present
    const yValues = mergedData?.map(d => d[dataKey]).filter(v => typeof v === "number") || [];
    const comparisonYValues = mergedData?.map(d => d[comparisonKey]).filter(v => typeof v === "number") || [];
    const allYValues = [...yValues, ...comparisonYValues];
    
    const yMin = allYValues.length ? Math.min(...allYValues) : 0;
    const yMax = allYValues.length ? Math.max(...allYValues) : 1;
    const yPadding = (yMax - yMin) * 0.3 || 1;
    const domain = [yMin - yPadding, yMax + yPadding];

    return (
        <Card ref={containerRef} className="h-full flex flex-col gap-2 py-4">
            {title !== "Data" && (
                <CardHeader>
                    <div className={'flex flex-row justify-between items-center'}>
                        <div className="font-medium text-sm">{title}</div>
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
            )}
            <CardContent className="flex-1 flex flex-col p-0">
                {title !== "Data" ?
                    (
                        <ChartContainer config={chartConfig} className={'h-full w-full min-h-0'}>
                            <LineChart
                                accessibilityLayer
                                data={mergedData}
                                margin={{
                                    top: 16,
                                    right: 36,
                                    bottom: 16,
                                    left: 16,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey={dataKey2 ? dataKey2 : "time"}
                                    // tickLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value.toFixed(2)}
                                    label={{
                                        value: dataKey2 ? "Trajectory Y" : "Time (sec)",
                                        position: "insideBottom",
                                        offset: -10, // Negative value moves label up, positive moves down
                                        textAnchor: "middle"
                                    }}
                                />
                                <YAxis
                                    dataKey={dataKey}
                                    tickLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value.toFixed(2)}
                                    domain={domain}
                                    label={{
                                        value: dataKey,
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
                                    key={`${dataKey}-current`}
                                    dataKey={dataKey}
                                    type={dataKey2 ? "linear" : "natural"}
                                    stroke={chartColor}
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                    name="Current Test"
                                    connectNulls={false}
                                />
                                {displayComparisonData && displayComparisonData.length > 0 && (
                                    <Line
                                        key={`${dataKey}-comparison`}
                                        dataKey={comparisonKey}
                                        type={dataKey2 ? "linear" : "natural"}
                                        stroke="#0f000f"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                        strokeDasharray="5 5"
                                        name="Comparison Test"
                                        connectNulls={false}
                                    />
                                )}

                            </LineChart>
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
                            <p className="text-gray-600 font-medium">Error loading data</p>
                            <p className="text-gray-500 text-sm mt-1">Leave and comeback later</p>
                        </div>
                    )
                }
            </CardContent>
        </Card>
    )
}

export default memo(Graph);