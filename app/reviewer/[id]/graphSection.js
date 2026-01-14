import Graph from "../../components/graphs/graph";
import TrajectoryGraph from "../../components/graphs/trajectoryGraph";

/**
 * GraphSection
 * Composes multiple small graph components to visualize key signals
 * from the test payload. Passes through comparison arrays when available
 * so the individual graph components can render overlays.
 */
export default function GraphSection({testData, comparisonData}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full grow min-h-0">
            {/* Distance over time */}
            <Graph 
                data={testData.distance} 
                comparisonData={comparisonData?.distance}
            />
            {/* Heading over time */}
            <Graph 
                data={testData.heading} 
                comparisonData={comparisonData?.heading}
            />
            {/* Velocity over time */}
            <Graph 
                data={testData.velocity} 
                comparisonData={comparisonData?.velocity}
            />
            {/* XY trajectory plot */}
            <TrajectoryGraph 
                data={testData.trajectory} 
                comparisonData={comparisonData?.trajectory}
            />
        </div>
    )
}