'use client';

import {ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area} from "recharts";

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

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={"text-xs text-black bg-gray-300 p-2 rounded-lg"}>
                    <p>Time: {label}</p>
                    <p>{`${dataKey}: ${payload[0].value}`}</p>
                    {dataKey2 && <p>{`${dataKey2}: ${payload[1].value}`}</p>}
                </div>
            );
        }

        return null;
    };

    return (
        <div className={'flex flex-col gap-2 h-full grow bg-white p-4 rounded-lg shadow-md'}>
            <p>{title}</p>
            <ResponsiveContainer height={"100%"} width={"100%"}>
                <AreaChart
                    width={400}
                    height={300}
                    data={data}
                    margin={{
                        top: 24,
                        right: 24,
                        left: 30, // Increased from 0
                        bottom: 12,
                    }}
                >
                    <Area type={"monotone"} dataKey={dataKey} stroke={chartColor} fill={chartColor} fillOpacity={0.6} />
                    {dataKey2 &&
                        <Area type={"monotone"} dataKey={dataKey2} stroke={CHART_COLORS.purple} fill={CHART_COLORS.purple} fillOpacity={0.6} />
                    }
                    <Tooltip content={<CustomTooltip/>} />
                    <XAxis
                        dataKey={"time"}
                        label={{ value: 'Time (sec)', position: 'bottom', offset: 0 }}
                        padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                        dataKey={dataKey}
                        label={{ value: title, angle: -90, position: 'insideLeft', offset: 10 }}
                        tickFormatter={(value) => value.toFixed(2)}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default Graph;