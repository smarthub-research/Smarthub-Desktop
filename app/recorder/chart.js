import {Line} from "react-chartjs-2";
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import React, {useMemo, useRef, useState} from "react";
import useFetchFlags from "./hooks/useFetchFlags";
import ChartToolbar from "./chartToolbar";

// Register required components and plugins
ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title,
);

// Constants for chart configuration
const CHART_TYPES = {
    DISPLACEMENT: 'Displacement vs Time',
    HEADING: 'Heading vs Time',
    VELOCITY: 'Velocity vs Time',
    TRAJECTORY: 'Trajectory'
};

// Constants for chart colors
const CHART_COLORS = {
    red: 'rgb(239, 68, 68)',
    blue: 'rgb(59, 130, 246)',
    green: 'rgb(34, 197, 94)',
    yellow: 'rgb(250, 204, 21)',
}

// Chart component for displaying various sensor data for different chart types
export default function Chart({ timeStamps, data, title, graphId }) {
    const [flags] = useFetchFlags({ graphId });
    const [dataPointCount, setDataPointCount] = useState(50);
    const [scrollPosition, setScrollPosition] = useState(0);
    const chartRef = useRef(null);

    // Helper functions to get chart title
    const getChartTitle = (chartType) => {
        const titles = {
            [CHART_TYPES.DISPLACEMENT]: 'Displacement (m)',
            [CHART_TYPES.HEADING]: 'Heading (degrees)',
            [CHART_TYPES.VELOCITY]: 'Velocity (m/s)',
            [CHART_TYPES.TRAJECTORY]: 'Y Trajectory (m)'
        };
        return titles[chartType] || '';
    };

    // Helper function to get chart color based on type
    const getChartColor = (chartType) => {
        const titles = {
            [CHART_TYPES.DISPLACEMENT]: CHART_COLORS.blue,
            [CHART_TYPES.HEADING]: CHART_COLORS.red,
            [CHART_TYPES.VELOCITY]: CHART_COLORS.green,
            [CHART_TYPES.TRAJECTORY]: CHART_COLORS.yellow
        };
        return titles[chartType] || '';
    };

    const chartTitle = getChartTitle(title);
    const chartColor = getChartColor(title);

    // Function to get axis title because it varies for trajectory charts
    const getXAxisTitle = (chartType) => {
        return chartType === CHART_TYPES.TRAJECTORY ? 'X Trajectory (m)' : 'Time (s)';
    };

    const isTrajectoryChart = title === CHART_TYPES.TRAJECTORY;

    // Convert the sensor data into chart format
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                labels: [],
                datasets: [{
                    label: "",
                    data: [],
                    borderColor: chartColor,
                    backgroundColor: chartColor,
                    tension: 0.3,
                }]
            };
        }

        // Determine visible data slice based on dataPointCount and scrollPosition
        const getVisibleDataSlice = () => {
            if (dataPointCount === 0) {
                // Show all data
                return { visibleData: data, visibleTimeStamps: timeStamps };
            }

            if (scrollPosition === 0) {
                // Show most recent data points
                return {
                    visibleData: data.slice(-dataPointCount),
                    visibleTimeStamps: timeStamps?.slice(-dataPointCount)
                };
            }

            // Calculate range based on scroll position
            const endPosition = Math.min(data.length, data.length - scrollPosition);
            const startPosition = Math.max(0, endPosition - dataPointCount);

            // Ensure we always show dataPointCount items if available
            if (endPosition - startPosition < dataPointCount && startPosition === 0 && data.length >= dataPointCount) {
                return {
                    visibleData: data.slice(0, dataPointCount),
                    visibleTimeStamps: timeStamps?.slice(0, dataPointCount)
                };
            }

            return {
                visibleData: data.slice(startPosition, endPosition),
                visibleTimeStamps: timeStamps?.slice(startPosition, endPosition)
            };
        };

        const { visibleData, visibleTimeStamps } = getVisibleDataSlice();

        if (isTrajectoryChart) {
            // For trajectory charts, trajectory_X is in timeStamps and trajectory_Y is in data
            const processedData = [];

            // Create x/y coordinates where x comes from timeStamps (trajectory_X) and y from data (trajectory_Y)
            for (let i = 0; i < visibleData.length; i++) {
                if (visibleTimeStamps && visibleTimeStamps[i] !== undefined && visibleData[i] !== undefined) {
                    processedData.push({
                        x: visibleTimeStamps[i],
                        y: visibleData[i]
                    });
                }
            }

            // Create primary dataset for trajectory
            const datasets = [{
                label: chartTitle,
                data: processedData,
                borderColor: chartColor,
                backgroundColor: chartColor,
                borderWidth: 2,
                tension: 0.3,
                order: 2,
                showLine: true,
                pointRadius: 2,
            }];

            return {
                datasets
            };
        } else {
            // Regular time-series charts
            const labels = visibleTimeStamps.map(ts => (ts / 1000).toFixed(2));
            // Create primary dataset
            const datasets = [{
                label: chartTitle,
                data: visibleData,
                borderColor: chartColor,
                backgroundColor: chartColor,
                borderWidth: 2,
                tension: 0.3,
                order: 2,
            }];

            // Add flag markers if applicable
            if (flags.length > 0 && visibleTimeStamps) {
                const flagData = createFlagDataset(visibleTimeStamps, visibleData, flags);
                datasets.push(flagData);
            }

            return { labels, datasets };
        }
    }, [data, timeStamps, title, flags, dataPointCount, scrollPosition, isTrajectoryChart]);

    // Create flag markers dataset
    const createFlagDataset = (timeStamps, processedData, flags) => {
        // Create a sparse array where only flag positions have values
        const flagData = Array(processedData.length).fill(null);

        flags.forEach(flag => {
            if (flag.timeStamp !== undefined) {
                // Find index of timestamp closest to flag timestamp
                const closestTimeIndex = timeStamps.findIndex(ts =>
                    Math.abs(ts - flag.timeStamp) < 100); // 100ms tolerance

                if (closestTimeIndex >= 0) {
                    flagData[closestTimeIndex] = processedData[closestTimeIndex];
                }
            }
        });

        return {
            label: "Flags",
            data: flagData,
            borderColor: "rgb(255, 255, 255)",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            pointRadius: 12,
            pointStyle: 'star',
            showLine: false,
            order: 1,
        };
    };

    // Chart options configuration
    const options = useMemo(() => {
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 }, // Disable animation for performance
            plugins: {
                legend: { display: false },
                title: {
                    display: false,
                    text: title,
                    color: 'rgba(255, 255, 255, 1)',
                    font: { size: 18, weight: 'bold' },
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: createTooltipConfig(title, flags, timeStamps),
            },
            interaction: {
                mode: 'nearest',
                intersect: false
            },
        };
        // When trajectory chart, we need to adjust the scales
        if (isTrajectoryChart) {
            return {
                ...baseOptions,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'X Trajectory (m)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 14, weight: 'medium' }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 12 }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Y Trajectory (m)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 14, weight: 'medium' }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 12 }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 3,
                        hoverRadius: 5,
                        borderWidth: 1
                    },
                    line: { borderWidth: 2 }
                }
            };
        } else {
            return {
                ...baseOptions,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: getXAxisTitle(title),
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 14, weight: 'medium' },
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            minRotation: 30,
                            maxRotation: 30,
                            font: { size: 12 }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartTitle,
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 14, weight: 'medium' }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 12 },

                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 5,
                        borderWidth: 0.5
                    },
                    line: { borderWidth: 1 }
                }
            };
        }
    }, [title, isTrajectoryChart, flags, timeStamps]);

    // Create tooltip configuration
    function createTooltipConfig(chartType, flags, timeStamps) {
        return {
            backgroundColor: 'rgba(10, 10, 10, 0.9)',
            titleColor: 'rgba(255, 255, 255, 0.9)',
            bodyColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: { weight: 'bold', size: 14 },
            bodyFont: { size: 13 },
            callbacks: {
                label: function(context) {
                    // Flag points
                    if (context.datasetIndex === 1 && context.raw !== null) {
                        const dataIndex = context.dataIndex;
                        if (!timeStamps || !timeStamps[dataIndex]) return 'Flag';

                        const ts = timeStamps[dataIndex];
                        const closestFlag = flags.find(flag =>
                            Math.abs(flag.timeStamp - ts) < 100);

                        if (closestFlag) {
                            return `Flag: ${closestFlag.comment}`;
                        }
                    }

                    // Trajectory chart points
                    if (chartType === CHART_TYPES.TRAJECTORY) {
                        const point = context.raw;
                        return `X: ${point.x.toFixed(2)}m, Y: ${point.y.toFixed(2)}m`;
                    }

                    // Format regular data points
                    const value = context.raw !== null ? context.raw.toFixed(2) : '0.00';

                    if (chartType === CHART_TYPES.HEADING) {
                        return `${context.dataset.label}: ${value}°`;
                    }

                    return `${context.dataset.label}: ${value}`;
                },
                title: function(tooltipItems) {
                    if (chartType === CHART_TYPES.TRAJECTORY) {
                        return 'Position Data';
                    }
                    return tooltipItems[0].label + ' seconds';
                }
            }
        };
    }

    return (
        <div className="grow w-full h-full p-6 bg-surface-50 rounded-xl shadow-lg transition-all duration-300 ">
            {data && data.length > 0 ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm text-gray-400">{title}</h3>
                        <ChartToolbar
                            dataPointCount={dataPointCount}
                            setDataPointCount={setDataPointCount}
                            scrollPosition={scrollPosition}
                            setScrollPosition={setScrollPosition}
                            data={data}
                            graphId={graphId}
                        />
                    </div>
                    {/* This is the actual graph component */}
                    <div className="h-[85%]">
                        <Line
                            ref={chartRef}
                            data={chartData}
                            options={options}
                        />
                    </div>
                    {/* Tells user how many points they are seeing out of the length*/}
                    <div className="text-right text-xs text-gray-500">
                        {data?.length > 0 &&
                            `Showing ${dataPointCount === 0 ? 'all' : Math.min(dataPointCount, data.length)} of ${data.length} data points`}
                    </div>
                </>
            ) : (
                <div className="h-full flex flex-col justify-center items-center text-gray-500">
                    <p className="text-xl font-medium mb-2">{title}</p>
                    <p className="text-sm">Waiting for data...</p>
                </div>
            )}


        </div>
    );
}