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
import React, {useEffect, useMemo} from "react";
import useFetchFlags from "../hooks/useFetchFlags";

// Register required components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

export default function DemoChart({ data, title }) {
    const [flags, setFlags] = useFetchFlags();

    useEffect(() => {
        // Listen for new BLE data
        window.electronAPI.onNewFlag((newFlag) => {
            setFlags((prevData) => [...prevData, newFlag]);
        });

    }, []);

    // Convert the sensor data into chart format
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                labels: [],
                datasets: [
                    {
                        label: "No Data",
                        data: [],
                        borderColor: "blue",
                        backgroundColor: "rgba(0, 0, 255, 0.1)",
                        tension: 0.4,
                    },
                    {
                        label: "No Data",
                        data: [],
                        borderColor: "red",
                        backgroundColor: "rgba(255, 0, 0, 0.1)",
                        tension: 0.4,
                    }
                ],
            };
        }

        // Extract timestamps for labels (convert to seconds for readability)
        const labels = data.map(item => (item.timeStamp / 1000).toFixed(2));

        // Process data based on the chart title
        let datapoints = [];
        let datasetLabel = "";

        if (title === 'Displacement vs Time') {
            datapoints = data.map(item => item.accel1);
            datasetLabel = "Displacement";
        } else if (title === 'Heading vs Time') {
            datapoints = data.map(item => item.gyro1);
            datasetLabel = "Heading";
        } else if (title === 'Velocity vs Time') {
            datapoints = data.map(item => item.accel2);
            datasetLabel = "Velocity";
        }

        return {
            labels,
            datasets: [
                {
                    label: datasetLabel,
                    data: datapoints,
                    borderColor: "rgb(53, 162, 235)",
                    backgroundColor: "rgba(53, 162, 235, 0.5)",
                    tension: 0.3,
                },
                {
                    label: "Flagged Data",
                    data: flags.map(flag => flag.value),
                    borderColor: "red",
                    backgroundColor: "rgba(255, 0, 0, 0.5)",
                    tension: 0.3,
                }
            ],
        };
    }, [data, title]);


    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time (seconds)',
                    color: 'rgba(255, 255, 255, 0.7)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
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
                color: 'rgba(255, 255, 255, 0.9)',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            }
        },
        animation: {
            duration: 0 // Disable animation for performance with large datasets
        }
    };

    return (
        <div className={'w-[80vw] h-[35vh] p-8 bg-[#0a0a0a] rounded-xl'}>
            <Line data={chartData} options={options}/>
        </div>
    );
}