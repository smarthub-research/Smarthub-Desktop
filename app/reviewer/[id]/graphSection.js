import Graph from "../../components/graphs/graph";
import TrajectoryGraph from "../../components/graphs/trajectoryGraph";

export default function GraphSection({testData, comparisonData}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full grow min-h-0">
            <Graph 
                data={testData.distance} 
                comparisonData={comparisonData?.distance}
            />
            <Graph 
                data={testData.heading} 
                comparisonData={comparisonData?.heading}
            />
            <Graph 
                data={testData.velocity} 
                comparisonData={comparisonData?.velocity}
            />
            <TrajectoryGraph 
                data={testData.trajectory} 
                comparisonData={comparisonData?.trajectory}
            />
        </div>
    )
}