import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title
} from "chart.js";
import React, { useMemo } from "react";

// Register required components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

export default function ReviewerChart({ data, title }) {
    // Convert the sensor data into chart format
    const chartData = useMemo(() => {

        // Get x-axis labels based on the chart title
        let labels = [];
        if (title === 'Trajectory') {
            labels = data.map(item => item.trajectoryX);
        } else {
            labels = data.map(item => (item.timeStamp / 1000).toFixed(2));
        }

        // Process data based on the chart title
        let datapoints = [];
        let datasetLabel = "";

        if (title === 'Displacement vs Time') {
            datapoints = data.map(item => item.displacement);
            datasetLabel = "Displacement (m)";
        } else if (title === 'Heading vs Time') {
            datapoints = data.map(item => item.heading);
            datasetLabel = "Heading (degrees)";
        } else if (title === 'Velocity vs Time') {
            datapoints = data.map(item => item.velocity);
            datasetLabel = "Velocity (m/s)";
        } else if (title === 'Trajectory') {
            datapoints = data.map(item => item.trajectoryY);
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

        return {
            labels,
            datasets
        };
    }, [data, title]);

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
                display: true,
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
                radius: 2,
                hoverRadius: 5,
                borderWidth: 1
            },
            line: {
                borderWidth: 2
            }
        }
    };

    return (
        <div className="w-full h-full p-6 bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-gray-700">
            <Line data={chartData} options={options}/>
        </div>
    );
}