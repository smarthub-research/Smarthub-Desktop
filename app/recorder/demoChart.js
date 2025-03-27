import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import React, {useMemo, useState, useRef} from "react";
import useFetchFlags from "../hooks/useFetchFlags";
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

export default function DemoChart({ data, title, graphId }) {
    const [flags] = useFetchFlags({ graphId });
    const [dataPointCount, setDataPointCount] = useState(50);
    const [scrollPosition, setScrollPosition] = useState(0);
    const chartRef = useRef(null);

    // Convert the sensor data into chart format
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                labels: [],
                datasets: [{
                    label: "",
                    data: [],
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.5)",
                    tension: 0.3,
                }]
            };
        }

        let visibleData;
        if (dataPointCount === 0) {
            // Show all data
            visibleData = data;
        } else if (scrollPosition === 0) {
            // Show most recent data points when scroll position is 0
            visibleData = data.slice(-dataPointCount);
        } else {
            // Calculate range based on scroll position
            const endPosition = Math.min(data.length, data.length - scrollPosition);
            const startPosition = Math.max(0, endPosition - dataPointCount);

            // Ensure we always show dataPointCount items if available
            if (endPosition - startPosition < dataPointCount && startPosition === 0 && data.length >= dataPointCount) {
                visibleData = data.slice(0, dataPointCount);
            } else {
                visibleData = data.slice(startPosition, endPosition);
            }
        }
        // Get x-axis labels based on the chart title
        let labels = [];
        if (title === 'Trajectory') {
            labels = visibleData.map(item => item.trajectoryX.toFixed(2));
        } else {
            labels = visibleData.map(item => (item.timeStamp / 1000).toFixed(2));
        }

        // Process data based on the chart title
        let datapoints = [];
        let datasetLabel = "";

        if (title === 'Displacement vs Time') {
            datapoints = visibleData.map(item => item.displacement);
            datasetLabel = "Displacement (m)";
        } else if (title === 'Heading vs Time') {
            datapoints = visibleData.map(item => item.heading);
            datasetLabel = "Heading (degrees)";
        } else if (title === 'Velocity vs Time') {
            datapoints = visibleData.map(item => item.velocity);
            datasetLabel = "Velocity (m/s)";
        } else if (title === 'Trajectory') {
            datapoints = visibleData.map(item => item.trajectoryY);
            datasetLabel = "Y Trajectory (m)";
        }

        // Create primary dataset
        const datasets = [{
            label: datasetLabel,
            data: datapoints,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderWidth: 2,
            tension: 0.3,
            order: 2,
        }];

        // Add flag markers if we have relevant flags
        if (flags.length > 0) {
            // Create a sparse array where only flag positions have values
            const flagData = Array(datapoints.length).fill(null);

            flags.forEach(flag => {
                if (title === 'Trajectory') {
                    // For trajectory chart, find the data point closest to when the flag was created
                    if (flag.timeStamp !== undefined) {
                        const closestTimeIndex = visibleData.findIndex(item =>
                            item.timeStamp && Math.abs(item.timeStamp - flag.timeStamp) < 100); // 100ms tolerance

                        if (closestTimeIndex >= 0) {
                            flagData[closestTimeIndex] = datapoints[closestTimeIndex];
                        }
                    }
                } else {
                    // For time-based charts, match by timestamp
                    if (flag.timeStamp !== undefined) {
                        const closestIndex = visibleData.findIndex(item =>
                            item.timeStamp && Math.abs(item.timeStamp - flag.timeStamp) < 100); // 100ms tolerance

                        if (closestIndex >= 0) {
                            flagData[closestIndex] = datapoints[closestIndex];
                        }
                    }
                }
            });

            // Add the flags dataset
            datasets.push({
                label: "Flags",
                data: flagData,
                borderColor: "rgb(239, 68, 68)",
                backgroundColor: "rgba(239, 68, 68, 0.7)",
                pointRadius: 12,
                pointStyle: 'star',
                showLine: false,
                order: 1,
            });
        }

        return {
            labels,
            datasets
        };
    }, [data, title, flags, dataPointCount, scrollPosition]);

    function setTitle() {
        if (title === 'Displacement vs Time') {
            return 'Displacement (m)';
        } else if (title === 'Heading vs Time') {
            return 'Heading (degrees)';
        } else if (title === 'Velocity vs Time') {
            return 'Velocity (m/s)';
        } else {
            return 'Y Trajectory (m)';
        }
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: `${title === 'Trajectory' ? 'X Trajectory (m)' : 'Time (s)'} `,
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        size: 14,
                        weight: 'medium'
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    maxRotation: 0,
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: setTitle(),
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        size: 14,
                        weight: 'medium'
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        size: 12
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
                text: title,
                color: 'rgba(255, 255, 255, 1)',
                font: {
                    size: 18,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.9)',
                titleColor: 'rgba(255, 255, 255, 0.9)',
                bodyColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: {
                    weight: 'bold',
                    size: 14
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context) {
                        // For flag points
                        if (context.datasetIndex === 1 && context.raw !== null) {
                            const timeStamp = parseFloat(context.label) * 1000; // Convert seconds to ms
                            const closestFlag = flags.find(flag =>
                                Math.abs(flag.timeStamp - timeStamp) < 100);

                            if (closestFlag) {
                                return `Flag: ${closestFlag.comment}`;
                            }
                        }

                        // For regular data points
                        const value = context.raw.toFixed(2); // Format to 2 decimal places

                        // Different formats based on chart type
                        if (title === 'Displacement vs Time') {
                            return `${context.dataset.label}: ${value}`;
                        } else if (title === 'Velocity vs Time') {
                            return `${context.dataset.label}: ${value}`;
                        } else if (title === 'Heading vs Time') {
                            return `${context.dataset.label}: ${value}°`;
                        } else if (title === 'Trajectory') {
                            return `Position: (${context.label}, ${value})`;
                        }

                        return context.dataset.label + ': ' + value;
                    },

                    // Optional: Customize tooltip title
                    title: function(tooltipItems) {
                        if (title === 'Trajectory') {
                            return 'Position Data';
                        }
                        return tooltipItems[0].label + ' seconds';
                    },
                }
            }
        },
        animation: {
            duration: 0 // Disable animation for performance with large datasets
        },
        interaction: {
            mode: 'nearest',
            intersect: false
        },
        elements: {
            point: {
                radius: 0,
                hoverRadius: 5,
                borderWidth: 0.5
            },
            line: {
                borderWidth: 1
            }
        }
    };

    return (
        <div className="w-[85vw] h-[38vh] p-6 bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <ChartToolbar
                    dataPointCount={dataPointCount}
                    setDataPointCount={setDataPointCount}
                    scrollPosition={scrollPosition}
                    setScrollPosition={setScrollPosition}
                    data={data}
                    graphId={graphId}
                />
            </div>

            {data && data.length > 0 ? (
                <div className="h-[85%]">
                    <Line
                        ref={chartRef}
                        data={chartData}
                        options={options}
                    />
                </div>
            ) : (
                <div className="h-full flex flex-col justify-center items-center text-gray-500">
                    <p className="text-xl font-medium mb-2">{title}</p>
                    <p className="text-sm">Waiting for data...</p>
                </div>
            )}

            <div className="text-right text-xs text-gray-500">
                {data?.length > 0 && `Showing ${dataPointCount === 0 ? 'all' : Math.min(dataPointCount, data.length)} of ${data.length} data points`}
            </div>
        </div>
    );
}