import ChartTabs from "./chartTabs";
import Chart from "../chart";
import {useState} from "react";
import {useTest} from "../context/testContext";

// Component to display charts based on the active tab
export default function ChartReview() {
    const { testData } = useTest()
    const [activeChartTab, setActiveChartTab] = useState('displacement');

    // Render the chart content based on the active tab
    const renderChartContent = () => {
        if (!testData) return <div className="p-8 text-center">No data available</div>;
        return (
            <>
                {activeChartTab === 'displacement' && (
                    <Chart
                        timeStamps={testData.timeStamp}
                        data={testData.displacement}
                        title="Displacement vs Time"
                        graphId={1}
                    />
                )}
                {activeChartTab === 'heading' && (
                    <Chart
                        timeStamps={testData.timeStamp}
                        data={testData.heading}
                        title="Heading vs Time"
                        graphId={2}
                    />
                )}
                {activeChartTab === 'velocity' && (
                    <Chart
                        timeStamps={testData.timeStamp}
                        data={testData.velocity}
                        title="Velocity vs Time"
                        graphId={3}
                    />
                )}
                {activeChartTab === 'trajectory' && (
                    <Chart
                        timeStamps={testData.trajectory_x}
                        data={testData.trajectory_y}
                        title="Trajectory"
                        graphId={4}
                    />
                )}
            </>
        );
    };

    return (
        <div className="bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden">
            {/* Set the tab then render the correct chart */}
            <ChartTabs activeChartTab={activeChartTab} setActiveChartTab={setActiveChartTab}/>
            <div className="h-[400px] p-4">
                {renderChartContent()}
            </div>
        </div>
    )
}