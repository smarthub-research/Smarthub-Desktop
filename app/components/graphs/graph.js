'use client';

import {CartesianGrid, Label, Line, LineChart, XAxis, YAxis} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { memo, useEffect, useRef, useState } from "react";

function useDebouncedResize(delay = 1000) {
    const [size, setSize] = useState({ width: 0, height: 0 });
    const ref = useRef();

    useEffect(() => {
        if (!ref.current) return;
        let timeout;
        const handleResize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (ref.current) {
                    setSize({
                        width: ref.current.offsetWidth,
                        height: ref.current.offsetHeight
                    });
                }
            }, delay);
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            clearTimeout(timeout);
            window.removeEventListener("resize", handleResize);
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

function Graph({data}) {

    const [containerRef, containerSize] = useDebouncedResize(1000);

    // Find first non-time key
    const dataKey = data && data.length > 0
        ? Object.keys(data[0]).find(key => key !== "time")
        : "data";

    // Find a second non-time key (if there are 3+ keys total)
    const dataKeys = data && data.length > 0
        ? Object.keys(data[0]).filter(key => key !== "time")
        : [];

    // Only define dataKey2 if we have more than one non-time key
    const dataKey2 = dataKeys.length > 1 ? dataKeys[1] : null;

    // Regex to format title better. First char = (.) and rest=([^_]*)
    const title = dataKey ? dataKey.replace(/^(.)([^_]*)(_.*)?$/, (_, firstChar, rest) => {
        return firstChar.toUpperCase() + rest;
    }) : '';

    const chartColor =
        dataKey === 'displacement' ? CHART_COLORS.red
            : dataKey === 'heading' ? CHART_COLORS.blue
                : dataKey === 'velocity' ? CHART_COLORS.green
                    : CHART_COLORS.yellow;

    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: "var(--chart-1)",
        },
    };

    // Y Axis domain calculation
    const yValues = data?.map(d => d[dataKey]).filter(v => typeof v === "number");
    const yMin = yValues && yValues.length ? Math.min(...yValues) : 0;
    const yMax = yValues && yValues.length ? Math.max(...yValues) : 1;
    const yPadding = (yMax - yMin) * 0.3 || 1;
    const domain = [yMin - yPadding, yMax + yPadding];

    return (
        <Card ref={containerRef}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={'max-h-[20dvh] w-full'}>
                    <LineChart
                        width={containerSize.width || 400}
                        height={containerSize.height ? containerSize.height - 80 : 300}
                        accessibilityLayer
                        data={data}
                        margin={{
                            right: 24,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={"time"}
                            tickLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => (value / 1000).toFixed(2)} // ms to seconds
                        />
                        <Label value="Time (s)" position="insideBottom" offset={-5} />

                        <YAxis
                            dataKey={dataKey}
                            tickLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.toFixed(2)}
                            domain={domain}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey={dataKey}
                            type="natural"
                            stroke={chartColor}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                        { dataKey2 && (
                            <Line
                                dataKey={dataKey2}
                                type="natural"
                                stroke={CHART_COLORS.purple}
                                strokeWidth={2}
                                dot={false}
                            />
                        )}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default memo(Graph);