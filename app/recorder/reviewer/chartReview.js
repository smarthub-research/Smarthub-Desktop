import ChartTabs from "./chartTabs";
import React, {useEffect, useState} from "react";
import {useTest} from "../context/testContext";
import Graph from "../../components/graphs/graph";
import TrajectoryGraph from "../../components/graphs/trajectoryGraph";

// Component for displaying and reviewing recorded chart data.
// Purpose: Shows different types of graphs (distance, heading, velocity, trajectory) based on selected tab.
// Uses live processedPackets if available, otherwise fetches saved review data from backend.
export default function ChartReview() {
    const { fetchReviewData, testData: rawTestData, processedPackets } = useTest();
    // State for the currently active chart tab
    const [activeChartTab, setActiveChartTab] = useState('distance');
    // State for the formatted test data to display
    const [testData, setTestData] = useState(null);
    // State for loading indicator
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Use processedPackets if available (live data), otherwise fetch saved data
        if (processedPackets.distance.length > 0) {
            setTestData(processedPackets);
            setIsLoading(false);
        } else if (rawTestData) {
            const loadReviewData = async () => {
                try {
                    const formattedData = await fetchReviewData();
                    setTestData(formattedData);
                    console.log(formattedData);
                } catch (error) {
                    console.error('Error fetching review data:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadReviewData();
        } else {
            setIsLoading(false);
        }
    }, [rawTestData, fetchReviewData, processedPackets]);

    // Render the chart content based on the active tab
    const renderChartContent = () => {
        if (!testData) return <div className="p-8 text-center">No data available</div>;
        return (
            <>
                {activeChartTab === 'distance' && (
                    <Graph data={testData.distance}/>
                )}
                {activeChartTab === 'heading' && (
                    <Graph data={testData.heading}/>
                )}
                {activeChartTab === 'velocity' && (
                    <Graph data={testData.velocity}/>
                )}
                {activeChartTab === 'trajectory' && (
                    <TrajectoryGraph data={testData.trajectory}/>
                )}
            </>
        );
    };

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            {/* Set the tab then render the correct chart */}
            <ChartTabs activeChartTab={activeChartTab} setActiveChartTab={setActiveChartTab}/>
            <div className="flex-1 min-h-0">
                {renderChartContent()}
            </div>
        </div>
    )
}