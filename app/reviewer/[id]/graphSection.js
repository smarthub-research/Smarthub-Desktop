import Graph from "../../components/graphs/graph";
import React from "react";

export default function GraphSection({testData}) {
    /**
     * Pairs timestamps with data based on the type its given
     * @requires dataType: String [displacement | heading | velocity]
     */
    function formatTestData(dataType) {
        return testData.timeStamp.map((time, index) => ({
            time: (Number(time) / 1000).toFixed(2),
            [dataType]: testData[dataType][index]
        }));
    }

    // Pairs trajectories with time stamps for trajectory graph
    function formatTrajectoryData() {
        return testData.timeStamp.map((time, index) => ({
            time: (Number(time) / 1000).toFixed(2),
            trajectory_x: testData.trajectory_x[index],
            trajectory_y: testData.trajectory_y[index]
        }))
    }

    return (
        <div className="grid grid-cols-2 gap-8 w-full grow">
            <Graph data={formatTestData("displacement")}/>
            <Graph data={formatTestData("heading")}/>
            <Graph data={formatTestData("velocity")}/>
            <Graph data={formatTrajectoryData()}/>
        </div>
    )
}