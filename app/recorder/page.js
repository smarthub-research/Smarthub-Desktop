'use client'
import React, { useEffect, useState } from "react";
import DemoChart from "./demoChart";
import {FiArrowLeft} from "react-icons/fi";
import Link from "next/link";
import FlagConsole from "../navbar/flagConsole";
import { useFlagging } from "../context/flaggingContext";

export default function Recorder() {
    const [displacement, setDisplacement] = useState([]);
    const [velocity, setVelocity] = useState([]);
    const [heading, setHeading] = useState([]);
    const [trajectory, setTrajectory] = useState([]);

    const { flagging, handleFlagging, width } = useFlagging();

    function handleData(data) {
        const { displacement, velocity, heading, trajectory, timeStamp } = data;

        const trajectoryY = trajectory.y;
        const trajectoryX = trajectory.x;

        // Check if the timeStamp is unique before adding to prevent duplication
        setDisplacement(prev => {
            // Don't add if we already have a point with this exact timestamp
            if (prev.some(item => item.timeStamp === timeStamp)) return prev;
            return [...prev, { timeStamp, displacement }];
        });

        setVelocity(prev => {
            if (prev.some(item => item.timeStamp === timeStamp)) return prev;
            return [...prev, { timeStamp, velocity }];
        });

        setHeading(prev => {
            if (prev.some(item => item.timeStamp === timeStamp)) return prev;
            return [...prev, { timeStamp, heading }];
        });

        setTrajectory(prev => {
            if (prev.some(item => item.timeStamp === timeStamp)) return prev;
            return [...prev, { trajectoryX, trajectoryY }];
        });
    }

    function clearData() {
        setDisplacement([]);
        setVelocity([]);
        setHeading([]);
        setTrajectory([]);
    }

    function handleEndRecording() {
        if (window.electronAPI) {
            window.electronAPI.setTestData({ displacement, velocity, heading, trajectory });
            handleFlagging(false);
        }
    }

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
                clearData(); // Reset the bleData array
            });
        }

        const fetchTestData = async () => {
            if (window.electronAPI) {
                try {
                    const response = await window.electronAPI.getTestData();
                    if (!response) return;
                    setDisplacement(response.displacement);
                    setVelocity(response.velocity);
                    setHeading(response.heading);
                    setTrajectory(response.trajectory);
                } catch (error) {
                    console.error('Error fetching test data:', error);
                }
            }
        };

        fetchTestData();
    }, []);

    return (
        <>
            <div className="flex flex-col gap-8 py-8 px-4 overflow-x-hidden"
                   style={{ width: flagging ? `${100 - width}vw` : '100vw' }}>
                <div className="flex grow justify-around">
                    <div className="flex items-center">
                        <Link
                            href={'/connector/'}
                            className="mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
                        >
                            <FiArrowLeft size={20}/>
                        </Link>
                        <h1 className="text-3xl font-bold">Test #</h1>
                    </div>

                    <div className="flex gap-3">
                        <Link href={"/reviewer/"}
                              onClick={handleEndRecording}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            Finish Test
                        </Link>
                    </div>
                </div>

                <div className={"flex flex-col self-center gap-8"}>
                    {/* Charts */}
                    <DemoChart data={displacement} title={'Displacement vs Time'} graphId={1}/>
                    <DemoChart data={heading} title={'Heading vs Time'} graphId={2}/>
                    <DemoChart data={velocity} title={'Velocity vs Time'} graphId={3}/>
                    <DemoChart data={trajectory} title={'Trajectory'} graphId={4}/>
                </div>
            </div>

            {flagging && (
                <FlagConsole setFlagging={handleFlagging}/>
            )}
        </>
    );
}