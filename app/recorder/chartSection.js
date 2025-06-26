import Chart from "./chart";
import React, {useEffect, useState} from "react";
import Graph from "../components/graphs/graph";

export default function ChartSection({boxView}) {
    const [displacement, setDisplacement] = useState([]);
    const [velocity, setVelocity] = useState([]);
    const [heading, setHeading] = useState([]);
    const [trajectory_x, setTrajectoryX] = useState([]);
    const [trajectory_y, setTrajectoryY] = useState([]);
    const [timeStamp, setTimeStamp] = useState([]);

    function handleData(data) {
        // Data is expected to be an object with properties: displacement, velocity, heading, trajectory_x, trajectory_y, timeStamp
        const { displacement, velocity, heading, trajectory_x, trajectory_y, timeStamp } = data;

        // Check if the timeStamp is unique before adding to prevent duplication
        setDisplacement(prev => {
            // Don't add if we already have a point with this exact timestamp
            if (prev.some(item => item.timeStamp === timeStamp)) return prev;
            return [...prev, displacement];
        });

        setVelocity(prev => {
            if (prev.some(item => item.timeStamp === timeStamp)) return prev;
            return [...prev, velocity];
        });

        setHeading(prev => {
            if (prev.some(item => item.timeStamp === timeStamp)) return prev;
            return [...prev, heading];
        });

        setTrajectoryY(prev => {
            if (prev.some(item => item.timeStamp === timeStamp)) return prev;
            return [...prev, trajectory_y];
        });

        setTrajectoryX(prev => {
            if (prev.some(item => item.timeStamp === timeStamp)) return prev;
            return [...prev, trajectory_x];
        });

        setTimeStamp(prev => {
            if (prev.some(item => item === timeStamp)) return prev;
            return [...prev, timeStamp];
        })
    }

    // reset the data arrays
    function clearData() {
        setDisplacement([]);
        setVelocity([]);
        setHeading([]);
        setTrajectoryX([]);
        setTrajectoryY([]);
        setTimeStamp([]);
    }

    // Effect to handle BLE data and initial fetch
    useEffect(() => {
        if (window.electronAPI) {
            // Listen for new BLE data
            window.electronAPI.onBLEData((newData) => {
                if (newData && newData.data) {
                    const dataArray = newData.data;
                    for (let i = 0; i < dataArray.length; i++) {
                        handleData(dataArray[i]);
                    }
                }
            });

            // Add restart listener
            window.electronAPI.onRestartRecording((eventData) => {
                console.log("Resetting recording data", eventData);
                clearData();
            });
        }

        // Fetch initial test data if we are opening an existing test
        const fetchTestData = async () => {
            if (window.electronAPI) {
                try {
                    const response = await window.electronAPI.getReviewData();
                    if (!response) return;
                    setDisplacement(response.displacement);
                    setVelocity(response.velocity);
                    setHeading(response.heading);
                    setTrajectoryX(response.trajectory_x);
                    setTrajectoryY(response.trajectory_y);
                } catch (error) {
                    console.error('Error fetching test data:', error);
                }
            }
        };

        fetchTestData();
    }, []);

    return (
        <div className={`${boxView ? 'grid grid-cols-2 gap-8 grow' : 'flex flex-col gap-8 grow'}`}>
            <Chart timeStamps={timeStamp} data={displacement} title={'Displacement vs Time'} graphId={1}/>
            <Chart timeStamps={timeStamp} data={heading} title={'Heading vs Time'} graphId={2}/>
            <Chart timeStamps={timeStamp} data={velocity} title={'Velocity vs Time'} graphId={3}/>
            <Chart timeStamps={trajectory_x} data={trajectory_y} title={'Trajectory'} graphId={4}/>
        </div>
    )
}