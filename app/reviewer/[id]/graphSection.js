import Graph from "../../components/graphs/graph";

export default function GraphSection({testData}) {
    return (
        <div className="grid grid-cols-2 gap-4 w-full grow">
            <Graph data={testData.displacement}/>
            <Graph data={testData.heading}/>
            <Graph data={testData.velocity}/>
            <Graph data={testData.trajectory}/>
        </div>
    )
}