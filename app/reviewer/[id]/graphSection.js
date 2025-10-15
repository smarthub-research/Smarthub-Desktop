import Graph from "../../components/graphs/graph";
import TrajectoryGraph from "../../components/graphs/trajectoryGraph";

export default function GraphSection({testData}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full grow min-h-0">
            <Graph data={testData.distance}/>
            <Graph data={testData.heading}/>
            <Graph data={testData.velocity}/>
            <TrajectoryGraph data={testData.trajectory}/>
        </div>
    )
}