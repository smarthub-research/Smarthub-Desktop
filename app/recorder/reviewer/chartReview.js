import ChartTabs from "./chartTabs";
import React, {useEffect, useState} from "react";
import {useTest} from "../context/testContext";
import Graph from "../../components/graphs/graph";
import TrajectoryGraph from "../../components/graphs/trajectoryGraph";


// Component to display charts based on the active tab
export default function ChartReview() {
    const { fetchReviewData, testData: rawTestData, processedPackets } = useTest();
    const [activeChartTab, setActiveChartTab] = useState('distance');
    const [testData, setTestData] = useState(null);
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