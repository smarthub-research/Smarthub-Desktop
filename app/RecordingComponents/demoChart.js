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
import React from "react";
import {white} from "next/dist/lib/picocolors";

// Register required components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

export default function DemoChart({ data }) {
    const tableData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Sales",
                data: [30, 45, 60, 70, 90, 100],
                borderColor: "blue",
                backgroundColor: "rgba(0, 0, 255, 0.1)",
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Demo Table',
                font: {
                    size: 16, // Optional: Set font size
                    weight: 'bold' // Optional: Set font weight
                }
            }
        },
    };

    return (
        <div className={'w-[80vw] h-[35vh] p-8 bg-[#0a0a0a] rounded-xl'}>
            <Line data={tableData} options={options}/>
        </div>
    )
}