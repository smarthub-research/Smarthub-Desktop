'use client'
import React, { useEffect, useState } from "react";
import DemoChart from "./demoChart";

export default function Page() {
    const [displacement, setDisplacement] = useState([]);
    const [velocity, setVelocity] = useState([]);
    const [heading, setHeading] = useState([]);
    const [trajectory, setTrajectory] = useState([]);

    function handleData(data) {
        if (data) {
            const { displacement , velocity, heading, trajectory, timeStamp } = data;

            const trajectoryY = trajectory.y;
            const trajectoryX = trajectory.x;

            setDisplacement(prev => [...prev, { timeStamp, displacement }]);
            setVelocity(prev => [...prev, { timeStamp, velocity }]);
            setHeading(prev => [...prev, { timeStamp, heading }]);
            setTrajectory(prev => [...prev, { trajectoryX, trajectoryY }]);
        }
    }

    function clearData() {
        setDisplacement([]);
        setVelocity([]);
        setHeading([]);
        setTrajectory([]);
    }

    function handleTestEnd() {
        window.electronAPI.setTestData({ displacement, velocity, heading, trajectory });
    }

    useEffect(() => {
        if (window.electronAPI) {
            // Listen for new BLE data
            window.electronAPI.onBLEData((newData) => {
                handleData(newData);
            });

            window.electronAPI.onTestEnd(() => {
                handleTestEnd();
            });

            // Add restart listener
            window.electronAPI.onRestartRecording((eventData) => {
                console.log("Resetting recording data", eventData);
                clearData(); // Reset the bleData array
            });
        }
    }, [displacement, velocity, heading, trajectory]);

    return (
        <div className={'flex flex-col gap-10 items-center py-8 px-4 overflow-x-hidden'}>
            <h1 className={'text-2xl ml-[9vw] font-semibold italic text-left self-start leading-[0.8rem]'}>Test #(test id)</h1>
            {/* Charts */}
            <DemoChart data={displacement} title={'Displacement vs Time'} graphId={1}/>
            <DemoChart data={heading} title={'Heading vs Time'} graphId={2}/>
            <DemoChart data={velocity} title={'Velocity vs Time'} graphId={3}/>
            <DemoChart data={trajectory} title={'Trajectory'} graphId={4}/>

            {/* Optional: Show calculated data */}
            {/*{bleData.length > 0 && <CalculatedData data={bleData}/>}*/}
        </div>
    );
}