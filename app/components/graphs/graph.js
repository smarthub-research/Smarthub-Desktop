'use client';

import {CartesianGrid, Line, LineChart, XAxis, YAxis} from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// Constants for chart colors
const CHART_COLORS = {
    red: 'rgb(239, 68, 68)',
    blue: 'rgb(59, 130, 246)',
    green: 'rgb(34, 197, 94)',
    yellow: 'rgb(250, 204, 21)',
    purple: '#8884d8'
}

function Graph({data}) {

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

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
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
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            dataKey={dataKey}
                            tickLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.toFixed(2)}
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

export default Graph;