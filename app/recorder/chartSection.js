import React, {useEffect} from "react";
import Graph from "../components/graphs/graph";
import TrajectoryGraph from "../components/graphs/trajectoryGraph";
import {useTest} from "./context/testContext";

export default function ChartSection({boxView}) {
    const { processedPackets, addProcessedData, clearProcessedData } = useTest();

    function handleData(data) {
        console.log(data)
        data = data.data
        // Add the new formatted data to the context
        addProcessedData(data);
    }

    function clearData() {
        clearProcessedData();
    }

    const restartHandler = () => {
        clearData();
    };

    useEffect(() => {
        if (window.electronAPI) {
            // Register listeners and store their cleanup functions
            const removeBleListener = window.electronAPI.onBLEData(handleData);
            const removeRestartListener = window.electronAPI.onRestartRecording(restartHandler);

            // Return combined cleanup function
            return () => {
                if (removeBleListener) removeBleListener();
                if (removeRestartListener) removeRestartListener();
            };
        }
    }, []);

    return (
        processedPackets.distance.length> 0 ? (
                <div className={`ml-16 ${boxView ? 'grid grid-cols-2 gap-8 grow h-[80dvh]' : 'flex flex-col gap-8'}`}>
                    <Graph data={processedPackets.distance}/>
                    <Graph data={processedPackets.heading}/>
                    <Graph data={processedPackets.velocity}/>
                    <TrajectoryGraph data={processedPackets.trajectory}/>
                </div>
            ) : (
            //     No data fallback
            <div className="flex flex-col items-center justify-center grow text-gray-500">
                <h3 className="text-xl font-semibold mb-2">No Test Data Available</h3>
                <p className="text-center text-sm mb-4">
                    Start recording to see distance, velocity, heading, and trajectory charts
                </p>
                <div className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-primary-300 rounded-full animate-pulse"></div>
                    <span>Waiting for BLE data...</span>
                </div>
            </div>
        )
    );
}