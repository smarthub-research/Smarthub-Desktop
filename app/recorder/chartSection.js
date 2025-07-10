import Chart from "./chart";
import React, {useEffect, useState} from "react";

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
        // Track if cleanup has occurred
        let isMounted = true;

        if (window.electronAPI) {
            // Listen for new BLE data
            const bleDataHandler = (newData) => {
                if (isMounted && newData && newData.data) {
                    const dataArray = newData.data;
                    for (let i = 0; i < dataArray.length; i++) {
                        handleData(dataArray[i]);
                    }
                }
            };

            // Add restart listener
            const restartHandler = (eventData) => {
                if (isMounted) {
                    clearData();
                }
            };

            window.electronAPI.onBLEData(bleDataHandler);
            window.electronAPI.onRestartRecording(restartHandler);

            // Cleanup function to remove listeners
            return () => {
                isMounted = false;
                if (window.electronAPI) {
                    window.electronAPI.removeListener('ble-data', bleDataHandler);
                    window.electronAPI.removeListener('restart-recording', restartHandler);
                }
            };
        }

        const fetchTestData = async () => {
            if (window.electronAPI) {
                try {
                    const response = await window.electronAPI.getTestData();
                    if (!response) return;

                    // Clear existing data first
                    clearData();

                    // Check if data exists in the expected format
                    if (Array.isArray(response.displacement) &&
                        Array.isArray(response.velocity) &&
                        Array.isArray(response.heading) &&
                        Array.isArray(response.trajectory_x) &&
                        Array.isArray(response.trajectory_y) &&
                        Array.isArray(response.timeStamp)) {

                        // Get the length of data arrays
                        const dataLength = response.timeStamp.length;

                        // Rebuild data points consistently
                        for (let i = 0; i < dataLength; i++) {
                            const timestamp = response.timeStamp[i];
                            const dataPoint = {
                                displacement: response.displacement[i],
                                velocity: response.velocity[i],
                                heading: response.heading[i],
                                trajectory_x: response.trajectory_x[i],
                                trajectory_y: response.trajectory_y[i],
                                timeStamp: timestamp
                            };
                            handleData(dataPoint);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching test data:', error);
                }
            }
        };

        fetchTestData();
    }, []);

    return (
        !timeStamp.length > 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-gray-500">
                <p className="text-sm">Waiting for data...</p>
            </div>
            ) : (
        <div className={`${boxView ? 'grid grid-cols-2 gap-8 grow' : 'flex flex-col gap-8 grow'}`}>
            <Chart timeStamps={timeStamp} data={displacement} title={'Displacement vs Time'} graphId={1}/>
            <Chart timeStamps={timeStamp} data={heading} title={'Heading vs Time'} graphId={2}/>
            <Chart timeStamps={timeStamp} data={velocity} title={'Velocity vs Time'} graphId={3}/>
            <Chart timeStamps={trajectory_x} data={trajectory_y} title={'Trajectory'} graphId={4}/>
        </div>
        )
    );
}